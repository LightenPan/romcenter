#shell
python main.py --offlinelist_xml="chsdats\CHS_GB_OL.zip" --lpl=GB中文 --output="output" --only_lpl=0
python main.py --offlinelist_xml="chsdats\CHS_GBC_OL.zip" --lpl=GBC中文 --output="output" --only_lpl=0
python main.py --offlinelist_xml="chsdats\yxjzy_ol_gba_data.zip" --lpl=GBA全集 --output="output" --only_lpl=0
python main.py --offlinelist_xml="chsdats\NdsBbs_OL_CHINESE.zip" --lpl=NDS中文 --output="output" --only_lpl=0 --local_imgs_dir=NdsBbs_OL_CHINESE
python main.py --offlinelist_xml="chsdats\NdsBbs_OL.zip" --lpl=NDS全集 --output="output" --only_lpl=0 --local_imgs_dir=NdsBbs_OL

python main.py --offlinelist_xml="chsdats\CHS_NES_OL.zip" --lpl=FC中文 --output="output" --only_lpl=0
python main.py --offlinelist_xml="chsdats\FC_OL_CHS.xml" --lpl=FC全集 --output="output" --only_lpl=1 --releaseNumber_use_imageNumber=1 --rom_title="%u %e"
python main.py --offlinelist_xml="chsdats\CHS_SNES_OL.zip" --lpl=SFC中文 --output="output" --only_lpl=0
python main.py --offlinelist_xml="chsdats\CHS_N64_OL.zip" --lpl=N64中文 --output="output" --only_lpl=0
python main.py --offlinelist_xml="chsdats\Official_OfflineList_No-Intro_N64_CHS.zip" --lpl=N64全集 --output="output" --only_lpl=0 --title_use_comment=1

python main.py --offlinelist_xml="chsdats\CHS_MD_OL.zip" --lpl=MD中文 --output="output" --only_lpl=0
python main.py --offlinelist_xml="chsdats\CHS_NGPC_OL.zip" --lpl=NGPC中文 --output="output" --only_lpl=0

python main.py --offlinelist_xml="chsdats\PC98xx - Chinese Games.zip" --lpl=PC98中文 --output="output" --only_lpl=0 --title_use_comment=1 --releaseNumber_use_imageNumber=1

python main.py --offlinelist_xml="chsdats\ADVANsCEne_PSP_CHS.zip" --lpl=PSP全集 --output="output" --only_lpl=0
python main.py --offlinelist_xml="chsdats\ADVANsCEne_PSN_CHS.zip" --lpl=PSPPSN全集 --output="output" --only_lpl=0 --title_use_comment=1
