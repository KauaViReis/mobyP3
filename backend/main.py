import os
import sys
import time
import logging
import tempfile
import subprocess
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from pydantic import BaseModel
import yt_dlp
import requests
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mobyP3")

app = FastAPI(
    title="mobyP3 Backend Engine v3.0 (Pro Edition)",
    description="Supports Playlists, Audio/Video Trimming, HD Cover Art & Subtitles",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InfoRequest(BaseModel):
    url: str

class TrimRequest(BaseModel):
    url: str
    start_time: int
    end_time: int
    format_id: Optional[str] = "best"
    ext: Optional[str] = "mp3"

class DownloadRequest(BaseModel):
    url: str
    format_id: str
    resolution: Optional[str] = "1080p"

class ProcessRequest(BaseModel):
    url: str
    media_type: str
    format: str
    quality: Optional[str] = "320"
    audio_fx: Optional[str] = "none"

CACHE_TTL_SECONDS = 600
info_cache: Dict[str, Dict[str, Any]] = {}

# Cookie support for YouTube bot detection bypass
COOKIES_FILE = os.path.join(os.path.dirname(__file__), 'cookies.txt')

def _get_cookies_path() -> Optional[str]:
    """Returns path to cookies file if available (file or env var)."""
    if os.path.exists(COOKIES_FILE):
        return COOKIES_FILE

    cookies_env = os.environ.get('YOUTUBE_COOKIES', '').strip()
    if cookies_env:
        import base64
        tmp_cookies = os.path.join(tempfile.gettempdir(), 'mobyp3_cookies.txt')
        try:
            decoded = base64.b64decode(cookies_env).decode('utf-8')
            with open(tmp_cookies, 'w', encoding='utf-8') as f:
                f.write(decoded)
        except Exception:
            with open(tmp_cookies, 'w', encoding='utf-8') as f:
                f.write(cookies_env)
        return tmp_cookies

    return None

_cookies_path = _get_cookies_path()
if _cookies_path:
    logger.info(f"YouTube cookies loaded from: {_cookies_path}")
else:
    logger.warning("No YouTube cookies found. Datacenter IPs may be blocked by YouTube.")

YTDL_BASE_OPTS: Dict[str, Any] = {
    'quiet': True,
    'no_warnings': True,
    'nocheckcertificate': True,
    'socket_timeout': 15,
    'geo_bypass': True,
    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
}

if _cookies_path:
    YTDL_BASE_OPTS['cookiefile'] = _cookies_path

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "online",
        "publisher": "BRUH LTDA",
        "engine": "Moby Engine v3.0 Pro",
        "yt_dlp_version": yt_dlp.version.__version__,
        "cookies_loaded": _cookies_path is not None,
        "message": "Motor v3.0 Pronto! Licensed by BRUH LTDA."
    }

@app.post("/api/info")
def get_video_info(req: InfoRequest):
    """Extract metadata including playlists, HD covers, subtitles & formats"""
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL inválida ou vazia.")

    current_time = time.time()

    if url in info_cache:
        cached_entry = info_cache[url]
        if current_time - cached_entry["timestamp"] < CACHE_TTL_SECONDS:
            logger.info(f"Retornando metadados do CACHE para: {url}")
            res_data = cached_entry["data"].copy()
            res_data["cached"] = True
            return res_data

    # Multi-strategy options for maximum compatibility on cloud servers
    attempts_opts = [
        # Strategy 1: Standard yt-dlp config (full format availability)
        {
            **YTDL_BASE_OPTS,
            'extract_flat': 'in_playlist',
            'playlistend': 20,
            'skip_download': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
        },
        # Strategy 2: Fallback with android_vr & mweb for cloud IP bot bypass
        {
            **YTDL_BASE_OPTS,
            'extract_flat': 'in_playlist',
            'playlistend': 20,
            'skip_download': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'extractor_args': {'youtube': {'player_client': ['android_vr', 'mweb']}},
        },
        # Strategy 3: Fallback with tv_embedded
        {
            **YTDL_BASE_OPTS,
            'extract_flat': 'in_playlist',
            'playlistend': 20,
            'skip_download': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'extractor_args': {'youtube': {'player_client': ['tv_embedded']}},
        }
    ]

    last_error = None

    for ydl_opts in attempts_opts:
        if _cookies_path:
            ydl_opts['cookiefile'] = _cookies_path

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)

                if not info:
                    raise HTTPException(status_code=404, detail="Não foi possível extrair metadados da URL.")

                # Check if Playlist
                if info.get('_type') == 'playlist' or 'entries' in info:
                    entries = info.get('entries', [])
                    playlist_items = []

                    for entry in entries[:20]:
                        if not entry:
                            continue
                        dur = entry.get('duration', 0) or 0
                        m, s = divmod(int(dur), 60)
                        h, m = divmod(m, 60)
                        dur_str = f"{h:02d}:{m:02d}:{s:02d}" if h > 0 else f"{m:02d}:{s:02d}"

                        playlist_items.append({
                            "id": entry.get('id'),
                            "title": entry.get('title', 'Item de Playlist'),
                            "thumbnail": entry.get('thumbnail') or (entry.get('thumbnails', [{}])[-1].get('url', '')),
                            "duration": dur_str,
                            "uploader": entry.get('uploader') or entry.get('channel', 'Desconhecido'),
                            "webpage_url": entry.get('webpage_url') or f"https://www.youtube.com/watch?v={entry.get('id')}"
                        })

                    result_data = {
                        "is_playlist": True,
                        "playlist_title": info.get('title', 'Playlist Selecionada'),
                        "uploader": info.get('uploader', 'Desconhecido'),
                        "playlist_count": len(playlist_items),
                        "playlist_items": playlist_items,
                        "webpage_url": url,
                        "cached": False
                    }

                    info_cache[url] = {"timestamp": current_time, "data": result_data}
                    return result_data

                # Single Video/Audio Extraction
                raw_formats = info.get('formats', [])
                audio_formats = []
                video_formats = []
                seen_resolutions = set()
                preview_url = None

                for f in raw_formats:
                    fmt_id = f.get('format_id')
                    ext = f.get('ext', 'mp4')
                    vcodec = f.get('vcodec', 'none')
                    acodec = f.get('acodec', 'none')
                    height = f.get('height')
                    filesize = f.get('filesize') or f.get('filesize_approx')
                    fps = f.get('fps')
                    direct_url = f.get('url')

                    filesize_mb = f"{round(filesize / (1024 * 1024), 1)} MB" if filesize else "Variável"
                    is_progressive = (vcodec != 'none') and (acodec != 'none')
                    is_audio_only = (vcodec == 'none') and (acodec != 'none')

                    if is_audio_only:
                        audio_formats.append({
                            "format_id": fmt_id,
                            "ext": "mp3" if ext in ["m4a", "webm"] else ext,
                            "quality": f"{f.get('abr', 128)} kbps" if f.get('abr') else "Áudio HD",
                            "filesize": filesize_mb,
                            "direct_url": direct_url,
                            "type": "audio",
                            "needs_merge": False,
                            "note": f.get('format_note', 'Áudio Original')
                        })
                    elif vcodec != 'none' and height:
                        res_label = f"{height}p"
                        if height >= 2160:
                            res_label = "4K (2160p)"
                        elif height >= 1440:
                            res_label = "2K (1440p)"
                        elif height >= 1080:
                            res_label = "1080p FHD"
                        elif height >= 720:
                            res_label = "720p HD"

                        if is_progressive and not preview_url and direct_url:
                            preview_url = direct_url

                        if res_label not in seen_resolutions:
                            seen_resolutions.add(res_label)
                            video_formats.append({
                                "format_id": fmt_id,
                                "ext": "mp4",
                                "resolution": res_label,
                                "raw_height": height,
                                "fps": fps,
                                "quality": f"{res_label} ({fps}fps)" if fps else res_label,
                                "filesize": filesize_mb,
                                "direct_url": direct_url,
                                "type": "video",
                                "needs_merge": not is_progressive
                            })

                video_formats.sort(key=lambda x: x.get('raw_height', 0), reverse=True)

                if not preview_url and video_formats and video_formats[-1].get('direct_url'):
                    preview_url = video_formats[-1].get('direct_url')

                # Cover Art (Thumbnails)
                thumbnails_list = info.get('thumbnails', [])
                maxres_thumbnail = info.get('thumbnail')
                if thumbnails_list:
                    maxres_thumbnail = thumbnails_list[-1].get('url', maxres_thumbnail)

                # Subtitles (Legendas)
                subtitles_data = []
                subs = info.get('subtitles', {}) or info.get('automatic_captions', {})
                for lang, sub_list in subs.items():
                    if sub_list and isinstance(sub_list, list):
                        for sub_item in sub_list:
                            if sub_item.get('ext') in ['vtt', 'srt']:
                                subtitles_data.append({
                                    "language": lang.upper(),
                                    "ext": sub_item.get('ext'),
                                    "url": sub_item.get('url')
                                })
                                break
                    if len(subtitles_data) >= 5:
                        break

                duration_secs = info.get('duration', 0) or 0
                mins, secs = divmod(int(duration_secs), 60)
                hrs, mins = divmod(mins, 60)
                duration_str = f"{hrs:02d}:{mins:02d}:{secs:02d}" if hrs > 0 else f"{mins:02d}:{secs:02d}"

                result_data = {
                    "is_playlist": False,
                    "id": info.get('id'),
                    "title": info.get('title', 'Mídia sem título'),
                    "thumbnail": info.get('thumbnail') or maxres_thumbnail,
                    "maxres_thumbnail": maxres_thumbnail,
                    "duration": duration_str,
                    "duration_seconds": duration_secs,
                    "uploader": info.get('uploader') or info.get('channel', 'Desconhecido'),
                    "view_count": info.get('view_count', 0),
                    "audio_formats": audio_formats[:4],
                    "video_formats": video_formats[:6],
                    "subtitles": subtitles_data,
                    "preview_video_url": preview_url,
                    "webpage_url": info.get('webpage_url', url),
                    "cached": False
                }

                info_cache[url] = {"timestamp": current_time, "data": result_data}
                return result_data

        except yt_dlp.utils.DownloadError as e:
            last_error = str(e)
            logger.warning(f"yt-dlp tentativa falhou: {last_error}")
            if "Private video" in last_error:
                raise HTTPException(status_code=400, detail="Este vídeo é privado.")
            if "Video unavailable" in last_error or "removed" in last_error:
                raise HTTPException(status_code=400, detail="Vídeo indisponível ou removido.")
            if "Unsupported URL" in last_error:
                raise HTTPException(status_code=400, detail="URL não suportada. Tente um link do YouTube, SoundCloud, etc.")
            if "Sign in" in last_error or "bot" in last_error.lower() or "403" in last_error:
                logger.info("Bot detection / 403 detectado, tentando próxima estratégia...")
                continue
            continue
        except Exception as e:
            last_error = str(e)
            logger.error(f"Erro inesperado na extração: {last_error}")
            continue

    # All strategies failed
    logger.error(f"Todas as estratégias de extração falharam para {url}: {last_error}")
    raise HTTPException(
        status_code=400,
        detail="Não foi possível processar esta mídia. Verifique se a URL é válida ou tente novamente em alguns instantes."
    )

@app.post("/api/trim")
def trim_media(req: TrimRequest):
    """Cut and download specific audio/video snippet (start_time to end_time)"""
    url = req.url.strip()
    start_s = req.start_time
    end_s = req.end_time

    if end_s <= start_s or (end_s - start_s) > 600:
        raise HTTPException(status_code=400, detail="Período de corte inválido (máx 10 minutos).")

    temp_dir = tempfile.mkdtemp()
    out_file = os.path.join(temp_dir, f"mobyP3_trim_{start_s}s_{end_s}s.{req.ext}")

    ydl_opts = {
        **YTDL_BASE_OPTS,
        'format': 'bestaudio/best' if req.ext == 'mp3' else 'bestvideo[height<=720]+bestaudio/best',
        'download_ranges': yt_dlp.utils.download_range_func(None, [(start_s, end_s)]),
        'force_keyframes_at_cuts': True,
        'outtmpl': out_file,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        if os.path.exists(out_file):
            return FileResponse(
                out_file,
                media_type="audio/mpeg" if req.ext == "mp3" else "video/mp4",
                filename=os.path.basename(out_file)
            )
        else:
            raise HTTPException(status_code=500, detail="Arquivo cortado não foi gerado.")
    except Exception as e:
        logger.error(f"Erro ao cortar mídia: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao recortar áudio/vídeo: {str(e)}")

@app.post("/api/download-merge")
def merge_and_download(req: DownloadRequest):
    """Download combined HD/4K MP4 file via FFmpeg"""
    url = req.url.strip()
    format_id = req.format_id

    temp_dir = tempfile.mkdtemp()
    output_template = os.path.join(temp_dir, "%(title)s.%(ext)s")

    ydl_opts = {
        **YTDL_BASE_OPTS,
        'format': f'{format_id}+bestaudio/best',
        'merge_output_format': 'mp4',
        'outtmpl': output_template,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            if not filename.endswith('.mp4'):
                filename = os.path.splitext(filename)[0] + '.mp4'

            if os.path.exists(filename):
                return FileResponse(
                    filename,
                    media_type="video/mp4",
                    filename=os.path.basename(filename)
                )
            else:
                raise HTTPException(status_code=500, detail="Arquivo mesclado não encontrado.")
    except Exception as e:
        logger.error(f"Erro na mesclagem FFmpeg: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao mesclar alta resolução: {str(e)}")

@app.get("/api/download")
@app.get("/api/proxy-download")
async def download_media(url: str = Query(...), filename: str = Query("mobyP3_video.mp4")):
    """Stream media directly to user device with Content-Disposition attachment header"""
    try:
        clean_filename = filename.replace('"', '').strip()
        if not clean_filename:
            clean_filename = "mobyP3_video.mp4"

        headers = {
            "User-Agent": YTDL_BASE_OPTS.get("user_agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        }

        async def video_stream():
            async with httpx.AsyncClient(follow_redirects=True, timeout=60.0) as client:
                async with client.stream("GET", url, headers=headers) as resp:
                    if resp.status_code >= 400:
                        raise HTTPException(status_code=resp.status_code, detail="Erro ao buscar vídeo remoto.")
                    async for chunk in resp.aiter_bytes(chunk_size=65536):
                        yield chunk

        return StreamingResponse(
            video_stream(),
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{clean_filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        logger.error(f"Erro ao transmitir arquivo via /api/download: {str(e)}")
        # Synchronous fallback with requests
        try:
            req = requests.get(url, stream=True, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)
            clean_filename = filename.replace('"', '').strip() or "mobyP3_video.mp4"
            return StreamingResponse(
                req.iter_content(chunk_size=65536),
                media_type="application/octet-stream",
                headers={
                    "Content-Disposition": f'attachment; filename="{clean_filename}"',
                    "Access-Control-Expose-Headers": "Content-Disposition"
                }
            )
        except Exception as err:
            raise HTTPException(status_code=500, detail=f"Erro no download: {str(err)}")

@app.post("/api/process")
async def process_custom_media(req: ProcessRequest):
    """
    Process custom format & quality downloads for Audio, Video, and Image/Thumbnail.
    Streams chunks via generator keeping RAM below 512MB.
    """
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL inválida ou vazia.")

    media_type = req.media_type.lower()
    fmt = req.format.lower()
    quality = (req.quality or 'best').lower()

    temp_dir = tempfile.mkdtemp()

    # --- CATEGORY 1: THUMBNAIL / COVER IMAGE EXTRACTION & CONVERSION ---
    if media_type == "thumbnail" or fmt in ["webp", "jpg", "jpeg", "png"]:
        try:
            ydl_opts_info = {
                **YTDL_BASE_OPTS,
                'skip_download': True,
            }
            if _cookies_path:
                ydl_opts_info['cookiefile'] = _cookies_path

            thumb_url = None
            title_clean = "mobyP3_cover"

            with yt_dlp.YoutubeDL(ydl_opts_info) as ydl:
                info = ydl.extract_info(url, download=False)
                if info:
                    title_raw = info.get('title', 'cover')
                    title_clean = "".join([c if c.isalnum() or c in " ._- " else "_" for c in title_raw]).strip()[:30] or "mobyP3_cover"
                    thumbnails = info.get('thumbnails', [])
                    if thumbnails:
                        thumb_url = thumbnails[-1].get('url')
                    if not thumb_url:
                        thumb_url = info.get('thumbnail')

            if not thumb_url:
                raise HTTPException(status_code=404, detail="Não foi possível obter a capa da mídia.")

            async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
                resp = await client.get(thumb_url)
                if resp.status_code >= 400:
                    raise HTTPException(status_code=resp.status_code, detail="Erro ao baixar imagem da capa.")
                
                content = resp.content

            media_type_header = "image/webp" if fmt == "webp" else ("image/png" if fmt == "png" else "image/jpeg")
            out_ext = "webp" if fmt == "webp" else ("png" if fmt == "png" else "jpg")
            filename_header = f"{title_clean}.{out_ext}"

            return Response(
                content=content,
                media_type=media_type_header,
                headers={
                    "Content-Disposition": f'attachment; filename="{filename_header}"',
                    "Access-Control-Expose-Headers": "Content-Disposition"
                }
            )

        except Exception as e:
            logger.error(f"Erro no download de thumbnail: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Erro ao processar imagem de capa: {str(e)}")

    # --- CATEGORY 2: AUDIO PROCESSING ---
    elif media_type == "audio":
        output_template = os.path.join(temp_dir, "%(title)s.%(ext)s")
        audio_codec = "mp3" if fmt == "mp3" else "m4a"
        audio_bitrate = "320" if "320" in quality else ("128" if "128" in quality else "192")

        postprocessors = []
        if fmt == "mp3":
            postprocessors.append({
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': audio_bitrate,
            })
        elif fmt == "m4a":
            postprocessors.append({
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'm4a',
            })
        
        postprocessors.append({
            'key': 'FFmpegMetadata',
            'add_metadata': True,
        })

        # Apply Audio FX Filters via FFmpeg
        audio_fx = (req.audio_fx or 'none').lower()
        postprocessor_args = []
        if audio_fx == 'chiptune':
            postprocessor_args = ['-af', 'aresample=8000,asetrate=8000*1.2,lowpass=f=3000']
        elif audio_fx == 'nightcore':
            postprocessor_args = ['-af', 'asetrate=44100*1.25,atempo=1.0']
        elif audio_fx == 'radio':
            postprocessor_args = ['-af', 'highpass=f=300,lowpass=f=3000']
        elif audio_fx == 'bassboost':
            postprocessor_args = ['-af', 'equalizer=f=60:width_type=h:width=50:g=10']

        ydl_opts = {
            **YTDL_BASE_OPTS,
            'format': 'bestaudio/best',
            'outtmpl': output_template,
            'postprocessors': postprocessors,
        }
        if postprocessor_args:
            ydl_opts['postprocessor_args'] = postprocessor_args

        if _cookies_path:
            ydl_opts['cookiefile'] = _cookies_path

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                title_raw = info.get('title', 'audio')
                clean_title = "".join([c if c.isalnum() or c in " ._- " else "_" for c in title_raw]).strip()[:30] or "mobyP3_audio"
                
                generated_files = [os.path.join(temp_dir, f) for f in os.listdir(temp_dir) if os.path.isfile(os.path.join(temp_dir, f))]
                if not generated_files:
                    raise HTTPException(status_code=500, detail="Arquivo de áudio não foi gerado.")
                
                target_file = generated_files[0]
                actual_ext = os.path.splitext(target_file)[1].lstrip('.') or audio_codec
                final_filename = f"{clean_title}_{audio_bitrate}k.{actual_ext}"

                def file_iterator(file_path: str, chunk_size: int = 65536):
                    with open(file_path, "rb") as f:
                        while chunk := f.read(chunk_size):
                            yield chunk
                    try:
                        os.remove(file_path)
                        os.rmdir(temp_dir)
                    except Exception:
                        pass

                return StreamingResponse(
                    file_iterator(target_file),
                    media_type="audio/mpeg" if actual_ext == "mp3" else "audio/mp4",
                    headers={
                        "Content-Disposition": f'attachment; filename="{final_filename}"',
                        "Access-Control-Expose-Headers": "Content-Disposition"
                    }
                )
        except Exception as e:
            logger.error(f"Erro no processamento de áudio: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Erro ao extrair áudio {fmt.upper()}: {str(e)}")

    # --- CATEGORY 3: VIDEO PROCESSING ---
    else:
        height_map = {"1080p": 1080, "720p": 720, "480p": 480, "360p": 360}
        max_height = height_map.get(quality, 1080)

        output_template = os.path.join(temp_dir, "%(title)s.%(ext)s")
        format_rule = f"bestvideo[height<={max_height}][ext=mp4]+bestaudio[ext=m4a]/best[height<={max_height}][ext=mp4]/best[height<={max_height}]/best"

        ydl_opts = {
            **YTDL_BASE_OPTS,
            'format': format_rule,
            'merge_output_format': 'mp4',
            'outtmpl': output_template,
        }
        if _cookies_path:
            ydl_opts['cookiefile'] = _cookies_path

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                title_raw = info.get('title', 'video')
                clean_title = "".join([c if c.isalnum() or c in " ._- " else "_" for c in title_raw]).strip()[:30] or "mobyP3_video"
                
                generated_files = [os.path.join(temp_dir, f) for f in os.listdir(temp_dir) if os.path.isfile(os.path.join(temp_dir, f))]
                if not generated_files:
                    raise HTTPException(status_code=500, detail="Arquivo de vídeo não foi gerado.")
                
                target_file = generated_files[0]
                final_filename = f"{clean_title}_{quality}.mp4"

                def file_iterator(file_path: str, chunk_size: int = 65536):
                    with open(file_path, "rb") as f:
                        while chunk := f.read(chunk_size):
                            yield chunk
                    try:
                        os.remove(file_path)
                        os.rmdir(temp_dir)
                    except Exception:
                        pass

                return StreamingResponse(
                    file_iterator(target_file),
                    media_type="video/mp4",
                    headers={
                        "Content-Disposition": f'attachment; filename="{final_filename}"',
                        "Access-Control-Expose-Headers": "Content-Disposition"
                    }
                )
        except Exception as e:
            logger.error(f"Erro no processamento de vídeo: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Erro ao extrair vídeo {quality}: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
