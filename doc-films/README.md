# 代码纪录片：南宋末路 · 南明十八年

用 [code-doc-film](https://github.com/bangbuilds/code-doc-film) skill 做的两条竖屏 3D 纪录短片（视频号 9:16）。画面全部由 three.js 实时渲染，地图用真实地形数据，配乐和环境声用 numpy 合成。

| 工程 | 片名 | 时长 | 成片 |
|---|---|---|---|
| `song-yashan/` | 南宋末路（1276—1279，从临安到崖山） | 1:42 | `song-yashan/renders/song-yashan-1080-small.mp4` |
| `nanming/` | 南明十八年（1644—1662，从北京到昆明） | 1:39 | `nanming/renders/nanming-1080-small.mp4` |

成片是 1080×1920、约 2 Mbps 的压缩版（为了能放进仓库）。母版和 8 Mbps 上传版太大，没有提交，需要时重新渲染即可。

## 每个工程里有什么

- `film.json`：唯一的事实来源。旁白、镜头、地图、数字标注、配乐，以及 `facts`（每个数字的出处）都在这里
- `scenes/`：每段一个三维场景文件（`_lib.js` 是城墙、崖山海湾等共用部件）
- `film/`：渲染引擎（来自 skill 模板）。**两处本地修改**：`overlay.js` 让标题卡支持 `\n` 换行；南明篇的 `map.js` 加大了地图相机的远裁剪面（竖屏大范围地图需要）
- `logs/PRODUCTION_LOG.md`：制作记录；`snapshots/final-contact.jpg`：成片每个镜头的中间帧

**没有提交**、可以重新生成的：`node_modules/`、`build/`、`audio/`（配音和配乐）、`assets/terrain.png`（地形）、`renders/` 里的母版。

## 重新生成

```bash
# 1. 装 skill 和依赖（Node 20+、Python 3.10+、ffmpeg）
git clone https://github.com/bangbuilds/code-doc-film ~/.claude/skills/code-doc-film
pip install numpy pillow kokoro-onnx soundfile "misaki[zh]"

# 2. 配音插件：本地 Kokoro 中文男声 zm_yunxi
mkdir -p ~/.config/code-doc-film && cp doc-films/tools/tts_kokoro.py ~/.config/code-doc-film/
npx hyperframes tts "测试" -o /tmp/t.wav    # 第一次运行会下载 Kokoro 模型到 ~/.cache/hyperframes/tts

# 3. 在工程目录里
cd doc-films/nanming
npm install
python3 scripts/film.py geo --download     # 地形（AWS Terrain Tiles）+ 河流（Natural Earth）
python3 scripts/film.py audio              # 配音 + 配乐 + 环境声
python3 scripts/film.py qa --frames        # 抽帧检查
python3 scripts/film.py render             # 渲染 + 打包
```

注意：
- 字体用思源宋体（Noto Serif CJK SC）。系统里没有的话，字幕会回落成黑体。
- 河流数据的官方下载地址 `naciscdn.org` 访问不了时，可以从 Natural Earth 的 GitHub 仓库下载 `ne_10m_rivers_lake_centerlines.{shp,dbf,shx}`，放到 `~/.cache/code-doc-film/ne/`。
- 没有 GPU 的机器是软件渲染，一条片子约 2.5 小时；有 GPU 时几分钟。

## 事实核对

两条片子的事实出处都写在各自 `film.json` 的 `facts` 里。制作时网络受限，**全部来自搜索摘要，没有打开原文逐字核对**，发布前请自行复核。故意没讲的内容（伤亡数字、有争议的地点等）见各条 fact 的备注。

地图不画任何国界、省界。地形数据：AWS Terrain Tiles（Mapzen），发布时请按其署名要求注明。
