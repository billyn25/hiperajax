const CSV_URL = './catalogo_ajax.csv';
const STORAGE_LISTA = 'presupuestos_ajax_hiperantena_lista';
const STORAGE_CONTADOR = 'presupuestos_ajax_hiperantena_contador';
const STORAGE_TEMA = 'presupuestador_ajax_tema';
const STORAGE_LISTA_BACKUP = 'presupuestos_ajax_hiperantena_lista_backup_v1';
const STORAGE_LISTA_META = 'presupuestos_ajax_hiperantena_lista_meta_v2';
const STORAGE_LISTA_SLOT_A = 'presupuestos_ajax_hiperantena_snapshot_a_v2';
const STORAGE_LISTA_SLOT_B = 'presupuestos_ajax_hiperantena_snapshot_b_v2';
const STORAGE_LISTA_LEGACY = [
  'presupuestos_ajax_hiperantena',
  'presupuestos_ajax_lista',
  'presupuestos_hiperajax_lista',
  'hiperajax_presupuestos',
  STORAGE_LISTA_BACKUP
];
const CSV_INTERNO = "name;brand;pvp\n10XAJ-BRANDPLATES-B;AJAX;102\n10XAJ-BRANDPLATES-W;AJAX;102\n10XAJ-KEYMCP;AJAX;12.6\n10XAJ-PASS-B;AJAX;58\n10XAJ-PASS-W;AJAX;58\n10XAJ-TAG-B;AJAX;66.2\n10XAJ-TAG-W;AJAX;66.2\nAJ-AC220V-PCB1;AJAX;34\nAJ-AC220V-PCB2;AJAX;34\nAJ-BASEBALLBAT-B;AJAX;60\nAJ-BATTERYBOX-14M;AJAX;334\nAJ-BATTERYBOX-7M;AJAX;222\nAJ-BATTERYKIT-12M;AJAX;410\nAJ-BRACKETDP-B;AJAX;6\nAJ-BRACKETDP-W;AJAX;6\nAJ-BRACKETFP-B;AJAX;8\nAJ-BRACKETFP-W;AJAX;8\nAJ-BRACKETFP2-W;AJAX;5.94\nAJ-BRACKETHS-B;AJAX;16\nAJ-BRACKETHS-W;AJAX;16\nAJ-BRACKETHUB-B;AJAX;16\nAJ-BRACKETHUB-W;AJAX;16\nAJ-BRACKETKP-B;AJAX;12\nAJ-BRACKETKP-W;AJAX;12\nAJ-BRACKETMAGNETDP-B;AJAX;6\nAJ-BRACKETMAGNETDP-W;AJAX;6\nAJ-BRACKETMC-B;AJAX;7.6\nAJ-BRACKETMC-W;AJAX;7.6\nAJ-BRACKETMCO-W;AJAX;20\nAJ-BRACKETMP-B;AJAX;8\nAJ-BRACKETMP-W;AJAX;8\nAJ-BRACKETMPC-B;AJAX;10\nAJ-BRACKETMPC-W;AJAX;10\nAJ-BRACKETMPO-W;AJAX;8\nAJ-BRACKETSS-B;AJAX;16\nAJ-BRACKETSS-W;AJAX;16\nAJ-BTOTEM2-W-ES;AJAX;1800\nAJ-BULLETCAM-4-HLVF-S-B;AJAX;482.46\nAJ-BULLETCAM-4-HLVF-S-W;AJAX;482.46\nAJ-BULLETCAM-5-0400-B;AJAX;245.6\nAJ-BULLETCAM-5-0400-HL-B;AJAX;254.92\nAJ-BULLETCAM-5-0400-HL-W;AJAX;254.92\nAJ-BULLETCAM-5-0400-W;AJAX;245.6\nAJ-BULLETCAM-5-B;AJAX;245.6\nAJ-BULLETCAM-5-HL-B;AJAX;254.92\nAJ-BULLETCAM-5-HL-W;AJAX;254.92\nAJ-BULLETCAM-5-HLVF-B;AJAX;348.44\nAJ-BULLETCAM-5-HLVF-W;AJAX;348.44\nAJ-BULLETCAM-5-W;AJAX;245.6\nAJ-BULLETCAM-8-0400-B;AJAX;327.5\nAJ-BULLETCAM-8-0400-HL-B;AJAX;339.92\nAJ-BULLETCAM-8-0400-HL-W;AJAX;339.92\nAJ-BULLETCAM-8-0400-W;AJAX;327.5\nAJ-BULLETCAM-8-B;AJAX;327.5\nAJ-BULLETCAM-8-HL-B;AJAX;339.92\nAJ-BULLETCAM-8-HL-W;AJAX;339.92\nAJ-BULLETCAM-8-HLVF-B;AJAX;482.46\nAJ-BULLETCAM-8-HLVF-S-B;AJAX;616.48\nAJ-BULLETCAM-8-HLVF-S-W;AJAX;616.48\nAJ-BULLETCAM-8-HLVF-W;AJAX;482.46\nAJ-BULLETCAM-8-W;AJAX;327.5\nAJ-BUTTON-B;AJAX;38.76\nAJ-BUTTON-W;AJAX;38.76\nAJ-BYPASS-DIMMER;AJAX;19.8\nAJ-CAP-B;AJAX;28\nAJ-CENTERBUTTON-1G2W-B;AJAX;13.44\nAJ-CENTERBUTTON-1G2W-B-VERT;AJAX;13.44\nAJ-CENTERBUTTON-1G2W-FOG;AJAX;13.44\nAJ-CENTERBUTTON-1G2W-GRA;AJAX;13.44\nAJ-CENTERBUTTON-1G2W-GRE;AJAX;13.44\nAJ-CENTERBUTTON-1G2W-IVO;AJAX;13.44\nAJ-CENTERBUTTON-1G2W-OLI;AJAX;13.44\nAJ-CENTERBUTTON-1G2W-OYS;AJAX;13.44\nAJ-CENTERBUTTON-1G2W-W;AJAX;13.44\nAJ-CENTERBUTTON-1G2W-W-VERT;AJAX;13.44\nAJ-CENTERBUTTON-2G-B;AJAX;14.36\nAJ-CENTERBUTTON-2G-B-VERT;AJAX;14.36\nAJ-CENTERBUTTON-2G-FOG;AJAX;14.36\nAJ-CENTERBUTTON-2G-GRA;AJAX;14.36\nAJ-CENTERBUTTON-2G-GRE;AJAX;14.36\nAJ-CENTERBUTTON-2G-IVO;AJAX;14.36\nAJ-CENTERBUTTON-2G-OLI;AJAX;14.36\nAJ-CENTERBUTTON-2G-OYS;AJAX;14.36\nAJ-CENTERBUTTON-2G-W;AJAX;14.36\nAJ-CENTERBUTTON-2G-W-VERT;AJAX;14.36\nAJ-CENTERBUTTON-DIMMER-B;AJAX;44.78\nAJ-CENTERBUTTON-DIMMER-B-VERT;AJAX;44.78\nAJ-CENTERBUTTON-DIMMER-W;AJAX;44.78\nAJ-CENTERBUTTON-DIMMER-W-VERT;AJAX;44.78\nAJ-CENTERCOVER-B;AJAX;13.08\nAJ-CENTERCOVER-CP-W;AJAX;9.3\nAJ-CENTERCOVER-FOG;AJAX;13.08\nAJ-CENTERCOVER-GRA;AJAX;13.08\nAJ-CENTERCOVER-GRE;AJAX;13.08\nAJ-CENTERCOVER-IVO;AJAX;13.08\nAJ-CENTERCOVER-LAN-B;AJAX;6.82\nAJ-CENTERCOVER-LAN-W;AJAX;6.82\nAJ-CENTERCOVER-OLI;AJAX;13.08\nAJ-CENTERCOVER-OYS;AJAX;13.08\nAJ-CENTERCOVER-SMART-B;AJAX;22.04\nAJ-CENTERCOVER-SMART-FOG;AJAX;22.04\nAJ-CENTERCOVER-SMART-GRA;AJAX;22.04\nAJ-CENTERCOVER-SMART-GRE;AJAX;22.04\nAJ-CENTERCOVER-SMART-IVO;AJAX;22.04\nAJ-CENTERCOVER-SMART-OLI;AJAX;22.04\nAJ-CENTERCOVER-SMART-OYS;AJAX;22.04\nAJ-CENTERCOVER-SMART-W;AJAX;22.04\nAJ-CENTERCOVER-W;AJAX;13.08\nAJ-COMBIPROTECT-B;AJAX;108.12\nAJ-COMBIPROTECT-B-DUMMY;AJAX;14\nAJ-COMBIPROTECT-W;AJAX;108.12\nAJ-COMBIPROTECT-W-DUMMY;AJAX;14\nAJ-COVERHOLDER-COVERPLATE;AJAX;10.08\nAJ-CUP;AJAX;20.3\nAJ-CURTAINCAMOUTDOOR-HIGHMOUNT-PHOD-W;AJAX;545.32\nAJ-CURTAINOUTDOOR-MINI-W;AJAX;165.78\nAJ-CURTAINOUTDOOR-W;AJAX;231.84\nAJ-CURTAINPROTECT-B;AJAX;93.84\nAJ-CURTAINPROTECT-B-DUMMY;AJAX;24\nAJ-CURTAINPROTECT-W;AJAX;93.84\nAJ-CURTAINPROTECT-W-DUMMY;AJAX;24\nAJ-DC1224V-PCB1;AJAX;34\nAJ-DC1224V-PCB2;AJAX;34\nAJ-DC12V-PSU-NVR;AJAX;38.32\nAJ-DC6V-PCB2;AJAX;34.68\nAJ-DEMOCASE-B;AJAX;700\nAJ-DEMOCASE-W;AJAX;700\nAJ-DEMOCASE2-B;AJAX;850\nAJ-DEMOCASE2-W;AJAX;850\nAJ-DINHOLDER;AJAX;13.4\nAJ-DOMECAM-4-HLVF-S-B;AJAX;482.46\nAJ-DOMECAM-4-HLVF-S-W;AJAX;482.46\nAJ-DOMECAM-5-HLVF-B;AJAX;348.44\nAJ-DOMECAM-5-HLVF-W;AJAX;348.44\nAJ-DOMECAM-8-HLVF-B;AJAX;482.46\nAJ-DOMECAM-8-HLVF-S-B;AJAX;616.48\nAJ-DOMECAM-8-HLVF-S-W;AJAX;616.48\nAJ-DOMECAM-8-HLVF-W;AJAX;482.46\nAJ-DOMECAM-MINI-5-0400-B;AJAX;245.6\nAJ-DOMECAM-MINI-5-0400-HL-B;AJAX;254.92\nAJ-DOMECAM-MINI-5-0400-HL-W;AJAX;254.92\nAJ-DOMECAM-MINI-5-0400-W;AJAX;245.6\nAJ-DOMECAM-MINI-5-B;AJAX;245.6\nAJ-DOMECAM-MINI-5-HL-B;AJAX;254.92\nAJ-DOMECAM-MINI-5-HL-W;AJAX;254.92\nAJ-DOMECAM-MINI-5-W;AJAX;245.6\nAJ-DOMECAM-MINI-8-0400-B;AJAX;327.5\nAJ-DOMECAM-MINI-8-0400-HL-B;AJAX;339.92\nAJ-DOMECAM-MINI-8-0400-HL-W;AJAX;339.92\nAJ-DOMECAM-MINI-8-0400-W;AJAX;327.5\nAJ-DOMECAM-MINI-8-B;AJAX;327.5\nAJ-DOMECAM-MINI-8-HL-B;AJAX;339.92\nAJ-DOMECAM-MINI-8-HL-W;AJAX;339.92\nAJ-DOMECAM-MINI-8-W;AJAX;327.5\nAJ-DOORBELL-4-B;AJAX;367.94\nAJ-DOORBELL-4-GRA;AJAX;367.94\nAJ-DOORBELL-4-GRE;AJAX;367.94\nAJ-DOORBELL-4-W;AJAX;367.94\nAJ-DOORPROTECT-B;AJAX;44.88\nAJ-DOORPROTECT-B-DUMMY;AJAX;9.78\nAJ-DOORPROTECT-W;AJAX;44.88\nAJ-DOORPROTECT-W-DUMMY;AJAX;2\nAJ-DOORPROTECTPLUS-B;AJAX;71.4\nAJ-DOORPROTECTPLUS-W;AJAX;71.4\nAJ-DOUBLEBUTTON-B;AJAX;38.76\nAJ-DOUBLEBUTTON-W;AJAX;38.76\nAJ-DUALCURTAINOUTDOOR-W;AJAX;269.28\nAJ-DUALCURTAINOUTDOOR-W-DUMMY;AJAX;76\nAJ-EXTERNALANTENNA-B;AJAX;29.8\nAJ-FIREPROTECT-B;AJAX;94.76\nAJ-FIREPROTECT-B-DUMMY;AJAX;24\nAJ-FIREPROTECT-W;AJAX;94.76\nAJ-FIREPROTECT-W-DUMMY;AJAX;24\nAJ-FIREPROTECT2-C-RB-B;AJAX;125.62\nAJ-FIREPROTECT2-C-RB-W;AJAX;125.62\nAJ-FIREPROTECT2-C-SB-B;AJAX;152.98\nAJ-FIREPROTECT2-C-SB-W;AJAX;152.98\nAJ-FIREPROTECT2-H-RB-B;AJAX;84.34\nAJ-FIREPROTECT2-H-RB-W;AJAX;84.34\nAJ-FIREPROTECT2-H-SB-B;AJAX;107.64\nAJ-FIREPROTECT2-H-SB-W;AJAX;107.64\nAJ-FIREPROTECT2-HC-AC-W;AJAX;151.02\nAJ-FIREPROTECT2-HC-RB-B;AJAX;126.74\nAJ-FIREPROTECT2-HC-RB-W;AJAX;126.74\nAJ-FIREPROTECT2-HC-SB-B;AJAX;154.38\nAJ-FIREPROTECT2-HC-SB-W;AJAX;154.38\nAJ-FIREPROTECT2-HS-RB-B;AJAX;99.94\nAJ-FIREPROTECT2-HS-RB-W;AJAX;99.94\nAJ-FIREPROTECT2-HS-SB-B;AJAX;122.06\nAJ-FIREPROTECT2-HS-SB-W;AJAX;122.06\nAJ-FIREPROTECT2-HSC-RB-B;AJAX;140.72\nAJ-FIREPROTECT2-HSC-RB-W;AJAX;140.72\nAJ-FIREPROTECT2-HSC-SB-B;AJAX;175.06\nAJ-FIREPROTECT2-HSC-SB-W;AJAX;175.06\nAJ-FIREPROTECTPLUS-B;AJAX;142.14\nAJ-FIREPROTECTPLUS-W;AJAX;142.14\nAJ-FRAME-2;AJAX;7.5\nAJ-FRAME-2-VERT;AJAX;7.5\nAJ-FRAME-3;AJAX;8.74\nAJ-FRAME-3-VERT;AJAX;8.74\nAJ-FRAME-4;AJAX;10.92\nAJ-FRAME-4-VERT;AJAX;10.92\nAJ-FRAME-5;AJAX;11.56\nAJ-FRAME-5-VERT;AJAX;11.56\nAJ-GLASSPROTECT-B;AJAX;77.52\nAJ-GLASSPROTECT-B-DUMMY;AJAX;8\nAJ-GLASSPROTECT-W;AJAX;77.52\nAJ-GLASSPROTECT-W-DUMMY;AJAX;8\nAJ-HOLDER-B;AJAX;7.14\nAJ-HOLDER-W;AJAX;7.14\nAJ-HOMESIREN-B;AJAX;74.72\nAJ-HOMESIREN-W;AJAX;74.72\nAJ-HOMESIREN-W-DUMMY;AJAX;18\nAJ-HOOD;AJAX;14.28\nAJ-HOOD-MOTIONCAMOUTDOOR;AJAX;14\nAJ-HUB-B;AJAX;201.96\nAJ-HUB-B-DUMMY;AJAX;30\nAJ-HUB-W;AJAX;201.96\nAJ-HUB-W-DUMMY;AJAX;30\nAJ-HUB2-4G-B;AJAX;373.62\nAJ-HUB2-4G-DC6V-W;AJAX;370\nAJ-HUB2-4G-W;AJAX;373.62\nAJ-HUB2-B;AJAX;281.52\nAJ-HUB2-DC6V-W;AJAX;281.52\nAJ-HUB2-W;AJAX;281.52\nAJ-HUB2KIT-DP-PHOD-B;AJAX;958\nAJ-HUB2KIT-DP-PHOD-W;AJAX;958\nAJ-HUB2KIT-DP-PRO-B;AJAX;918\nAJ-HUB2KIT-DP-PRO-W;AJAX;918\nAJ-HUB2KIT-MP-PHOD-B;AJAX;964\nAJ-HUB2KIT-MP-PHOD-W;AJAX;964\nAJ-HUB2KIT-MP-PRO-B;AJAX;924\nAJ-HUB2KIT-MP-PRO-W;AJAX;924\nAJ-HUB2KIT4G-DP-PHOD-B;AJAX;1052\nAJ-HUB2KIT4G-DP-PHOD-W;AJAX;1052\nAJ-HUB2KIT4G-DP-PRO-B;AJAX;1012\nAJ-HUB2KIT4G-DP-PRO-W;AJAX;1012\nAJ-HUB2KIT4G-MP-PHOD-B;AJAX;1058\nAJ-HUB2KIT4G-MP-PHOD-W;AJAX;1058\nAJ-HUB2KIT4G-MP-PRO-B;AJAX;1018\nAJ-HUB2KIT4G-MP-PRO-W;AJAX;1018\nAJ-HUB2PLUS-B;AJAX;464.5\nAJ-HUB2PLUS-W;AJAX;464.5\nAJ-HUBBATT-2W;AJAX;32\nAJ-HUBBATT-3W;AJAX;36\nAJ-HUBBATT-4G;AJAX;34\nAJ-HUBBP-V2-B;AJAX;361.26\nAJ-HUBBP-V2-NOCASE;AJAX;347.86\nAJ-HUBBP-V2-W;AJAX;361.26\nAJ-HUBKIT-B;AJAX;358.66\nAJ-HUBKIT-RENOVE1-B;AJAX;550\nAJ-HUBKIT-RENOVE1-W;AJAX;550\nAJ-HUBKIT-RENOVE2-B;AJAX;520\nAJ-HUBKIT-RENOVE2-W;AJAX;520\nAJ-HUBKIT-W;AJAX;358.66\nAJ-INDOORCAM-4-B;AJAX;306.6\nAJ-INDOORCAM-4-W;AJAX;306.6\nAJ-INTERNALBATTERY-NB-72V95AH;AJAX;185.98\nAJ-INTERNALBATTERY-RB-64V36AH;AJAX;119.14\nAJ-JUNCTIONBOX-B;AJAX;41.7\nAJ-JUNCTIONBOX-W;AJAX;41.7\nAJ-KEYPAD-B;AJAX;126.48\nAJ-KEYPAD-B-DUMMY;AJAX;28\nAJ-KEYPAD-W;AJAX;126.48\nAJ-KEYPAD-W-DUMMY;AJAX;28\nAJ-KEYPADCOMBI-W-DUMMY;AJAX;32\nAJ-KEYPADOUTDOOR-B;AJAX;235.7\nAJ-KEYPADOUTDOOR-GRA;AJAX;235.7\nAJ-KEYPADOUTDOOR-W;AJAX;235.7\nAJ-KEYPADPLUS-B;AJAX;141.38\nAJ-KEYPADPLUS-W;AJAX;141.38\nAJ-KEYPADPLUS-W-DUMMY;AJAX;42.38\nAJ-KEYPADTOUCHSCREEN-B;AJAX;364.14\nAJ-KEYPADTOUCHSCREEN-W;AJAX;364.14\nAJ-LEAKSPROTECT-B;AJAX;63.86\nAJ-LEAKSPROTECT-W;AJAX;63.86\nAJ-LEDSTRIPS;AJAX;16\nAJ-LIFEQUALITY-B;AJAX;324.7\nAJ-LIFEQUALITY-LITE-B;AJAX;96.38\nAJ-LIFEQUALITY-LITE-W;AJAX;96.38\nAJ-LIFEQUALITY-W;AJAX;324.7\nAJ-LIGHTCORE-1G;AJAX;72.74\nAJ-LIGHTCORE-1G-VERT;AJAX;72.74\nAJ-LIGHTCORE-2G;AJAX;83.68\nAJ-LIGHTCORE-2G-VERT;AJAX;83.68\nAJ-LIGHTCORE-2G2W;AJAX;107.48\nAJ-LIGHTCORE-2G2W-VERT;AJAX;107.48\nAJ-LIGHTCORE-2W;AJAX;77.74\nAJ-LIGHTCORE-2W-VERT;AJAX;77.74\nAJ-LIGHTCORE-CROSS;AJAX;109.1\nAJ-LIGHTCORE-CROSS-VERT;AJAX;109.1\nAJ-LIGHTCORE-DIMMER;AJAX;130.52\nAJ-LIGHTCORE-DIMMER-VERT;AJAX;130.52\nAJ-MAGNET-B;AJAX;8\nAJ-MAGNET-W;AJAX;8\nAJ-MANUALCALLPOINT-BLUE;AJAX;112.46\nAJ-MANUALCALLPOINT-GREEN;AJAX;112.46\nAJ-MANUALCALLPOINT-WHITE;AJAX;112.46\nAJ-MANUALCALLPOINT-YELLOW;AJAX;112.46\nAJ-MINIHUB-W;AJAX;8\nAJ-MOTIONCAM-B-DUMMY;AJAX;50\nAJ-MOTIONCAM-HDR-B;AJAX;171.36\nAJ-MOTIONCAM-HDR-PHOD-B;AJAX;191.76\nAJ-MOTIONCAM-HDR-PHOD-W;AJAX;191.76\nAJ-MOTIONCAM-HDR-W;AJAX;171.36\nAJ-MOTIONCAM-W-DUMMY;AJAX;50\nAJ-MOTIONCAMOUTDOOR-HIGHMOUNT-PHOD-W;AJAX;556.22\nAJ-MOTIONCAMOUTDOOR-PHOD-W;AJAX;387.6\nAJ-MOTIONCAMOUTDOOR-W;AJAX;342.72\nAJ-MOTIONCAMOUTDOOR-W-DUMMY;AJAX;68.46\nAJ-MOTIONCAMOUTDOOR-W-LENS;AJAX;8\nAJ-MOTIONPROTECT-B;AJAX;77.52\nAJ-MOTIONPROTECT-B-DUMMY;AJAX;12\nAJ-MOTIONPROTECT-B-LENS;AJAX;2.8\nAJ-MOTIONPROTECT-W;AJAX;77.52\nAJ-MOTIONPROTECT-W-DUMMY;AJAX;12\nAJ-MOTIONPROTECT-W-LENS;AJAX;2.8\nAJ-MOTIONPROTECTPLUS-B;AJAX;106.08\nAJ-MOTIONPROTECTPLUS-W;AJAX;106.08\nAJ-MOUNTCAM-A1-B;AJAX;51.18\nAJ-MOUNTCAM-A1-W;AJAX;51.18\nAJ-MOUNTCAM-A2-B;AJAX;68.22\nAJ-MOUNTCAM-A2-W;AJAX;68.22\nAJ-MOUNTCAM-B1-B;AJAX;73.1\nAJ-MOUNTCAM-B1-W;AJAX;73.1\nAJ-MOUNTCAM-B2-B;AJAX;90.16\nAJ-MOUNTCAM-B2-W;AJAX;90.16\nAJ-MULTITRANSMITTER-3EOL-B;AJAX;189.72\nAJ-MULTITRANSMITTER-3EOL-W-NF;AJAX;186\nAJ-NVR108-B;AJAX;282.6\nAJ-NVR108-DC-B;AJAX;282.6\nAJ-NVR108-DC-W;AJAX;282.6\nAJ-NVR108-HAC-B;AJAX;324.98\nAJ-NVR108-HAC-W;AJAX;324.98\nAJ-NVR108-HDC-B;AJAX;324.98\nAJ-NVR108-HDC-W;AJAX;324.98\nAJ-NVR108-W;AJAX;282.6\nAJ-NVR116-B;AJAX;434.82\nAJ-NVR116-DC-B;AJAX;434.82\nAJ-NVR116-DC-W;AJAX;434.82\nAJ-NVR116-HAC-B;AJAX;500.04\nAJ-NVR116-HAC-W;AJAX;500.04\nAJ-NVR116-HDC-B;AJAX;500.04\nAJ-NVR116-HDC-W;AJAX;500.04\nAJ-NVR116-W;AJAX;434.82\nAJ-NVR208-HAC-8P-B;AJAX;430.98\nAJ-NVR208-HAC-8P-W;AJAX;430.98\nAJ-NVR208-HAC-AI-8P-S-B;AJAX;469.74\nAJ-NVR208-HAC-AI-8P-S-W;AJAX;469.74\nAJ-NVR208-HAC-B;AJAX;296.98\nAJ-NVR208-HAC-W;AJAX;296.98\nAJ-NVR208-HAC2G-AI-S-B;AJAX;335.72\nAJ-NVR208-HAC2G-AI-S-W;AJAX;335.72\nAJ-NVR216-HAC-16P-B;AJAX;724.94\nAJ-NVR216-HAC-16P-W;AJAX;724.94\nAJ-NVR216-HAC-8P-B;AJAX;590.92\nAJ-NVR216-HAC-8P-W;AJAX;590.92\nAJ-NVR216-HAC-AI-16P-S-B;AJAX;784.56\nAJ-NVR216-HAC-AI-16P-S-W;AJAX;784.56\nAJ-NVR216-HAC-AI-8P-S-B;AJAX;650.54\nAJ-NVR216-HAC-AI-8P-S-W;AJAX;650.54\nAJ-NVR216-HAC-B;AJAX;456.92\nAJ-NVR216-HAC-W;AJAX;456.92\nAJ-NVR216-HAC2G-AI-S-B;AJAX;516.52\nAJ-NVR216-HAC2G-AI-S-W;AJAX;516.52\nAJ-NVR232-HAC-AI-16P-S-B;AJAX;1059.12\nAJ-NVR232-HAC-AI-16P-S-W;AJAX;1059.12\nAJ-NVR232-HAC2G-AI-S-B;AJAX;697.3\nAJ-NVR232-HAC2G-AI-S-W;AJAX;697.3\nAJ-NVRKIT108-2XBULLET-W;AJAX;703.48\nAJ-NVRKIT108-2XTURRET-W;AJAX;703.48\nAJ-NVRKIT108B-2W;AJAX;600\nAJ-NVRKIT108T-4;AJAX;510.1\nAJ-OCBRIDGEPLUS;AJAX;85.68\nAJ-OUTDOORPROTECT-W;AJAX;240.72\nAJ-OUTDOORPROTECT-W-DUMMY;AJAX;36\nAJ-OUTDOORPROTECT-W-LENS;AJAX;3\nAJ-OUTLETCORE-BASIC;AJAX;26.04\nAJ-OUTLETCORE-BASIC-VERT;AJAX;26.04\nAJ-OUTLETCORE-LAN-B;AJAX;14.2\nAJ-OUTLETCORE-LAN-W;AJAX;14.2\nAJ-OUTLETCORE-SMART;AJAX;65.04\nAJ-PASS-B;AJAX;5.8\nAJ-PASS-W;AJAX;5.8\nAJ-POLO-L;AJAX;59\nAJ-POLO-M;AJAX;62\nAJ-POLO-S;AJAX;59\nAJ-POLO-XL;AJAX;62\nAJ-POLO-XXL;AJAX;59\nAJ-REEDSWITCH;AJAX;2.22\nAJ-RELAY;AJAX;55.62\nAJ-REPAIRKITHUB-W;AJAX;30\nAJ-REX-B;AJAX;159.12\nAJ-REX-W;AJAX;159.12\nAJ-REX2-B;AJAX;236.64\nAJ-REX2-W-NF;AJAX;232\nAJ-SIDEBUTTON-1G2W-B;AJAX;11.56\nAJ-SIDEBUTTON-1G2W-B-VERT;AJAX;11.56\nAJ-SIDEBUTTON-1G2W-FOG;AJAX;11.56\nAJ-SIDEBUTTON-1G2W-GRA;AJAX;11.56\nAJ-SIDEBUTTON-1G2W-GRE;AJAX;11.56\nAJ-SIDEBUTTON-1G2W-IVO;AJAX;11.56\nAJ-SIDEBUTTON-1G2W-OLI;AJAX;11.56\nAJ-SIDEBUTTON-1G2W-OYS;AJAX;11.56\nAJ-SIDEBUTTON-1G2W-W;AJAX;11.56\nAJ-SIDEBUTTON-1G2W-W-VERT;AJAX;11.56\nAJ-SIDEBUTTON-2G-B;AJAX;12.48\nAJ-SIDEBUTTON-2G-B-VERT;AJAX;12.48\nAJ-SIDEBUTTON-2G-FOG;AJAX;12.48\nAJ-SIDEBUTTON-2G-GRA;AJAX;12.48\nAJ-SIDEBUTTON-2G-GRE;AJAX;12.48\nAJ-SIDEBUTTON-2G-IVO;AJAX;12.48\nAJ-SIDEBUTTON-2G-OLI;AJAX;12.48\nAJ-SIDEBUTTON-2G-OLI-VERT;AJAX;12.48\nAJ-SIDEBUTTON-2G-OYS;AJAX;12.48\nAJ-SIDEBUTTON-2G-W;AJAX;12.48\nAJ-SIDEBUTTON-2G-W-VERT;AJAX;12.48\nAJ-SIDEBUTTON-DIMMER-B;AJAX;44.78\nAJ-SIDEBUTTON-DIMMER-B-VERT;AJAX;44.78\nAJ-SIDEBUTTON-DIMMER-W;AJAX;44.78\nAJ-SIDEBUTTON-DIMMER-W-VERT;AJAX;44.78\nAJ-SIDECOVER-B;AJAX;13.08\nAJ-SIDECOVER-CP-W;AJAX;6.72\nAJ-SIDECOVER-FOG;AJAX;13.08\nAJ-SIDECOVER-GRA;AJAX;13.08\nAJ-SIDECOVER-GRE;AJAX;13.08\nAJ-SIDECOVER-IVO;AJAX;13.08\nAJ-SIDECOVER-LAN-B;AJAX;6.88\nAJ-SIDECOVER-LAN-W;AJAX;6.88\nAJ-SIDECOVER-OLI;AJAX;13.08\nAJ-SIDECOVER-OYS;AJAX;13.08\nAJ-SIDECOVER-SMART-B;AJAX;22.38\nAJ-SIDECOVER-SMART-FOG;AJAX;22.38\nAJ-SIDECOVER-SMART-GRA;AJAX;22.38\nAJ-SIDECOVER-SMART-GRE;AJAX;22.38\nAJ-SIDECOVER-SMART-IVO;AJAX;22.38\nAJ-SIDECOVER-SMART-OLI;AJAX;22.38\nAJ-SIDECOVER-SMART-OYS;AJAX;22.38\nAJ-SIDECOVER-SMART-W;AJAX;22.38\nAJ-SIDECOVER-W;AJAX;13.08\nAJ-SIM;AJAX;0\nAJ-SIMSLOT;AJAX;6\nAJ-SMALLMAGNET-B;AJAX;5.94\nAJ-SOCKET-B;AJAX;94.76\nAJ-SOCKET-G-W;AJAX;87.3\nAJ-SOCKET-W;AJAX;94.76\nAJ-SOLOBUTTON-1G2W-B;AJAX;12.18\nAJ-SOLOBUTTON-1G2W-FOG;AJAX;12.18\nAJ-SOLOBUTTON-1G2W-GRA;AJAX;12.18\nAJ-SOLOBUTTON-1G2W-GRE;AJAX;12.18\nAJ-SOLOBUTTON-1G2W-IVO;AJAX;12.18\nAJ-SOLOBUTTON-1G2W-OLI;AJAX;12.18\nAJ-SOLOBUTTON-1G2W-OYS;AJAX;12.18\nAJ-SOLOBUTTON-1G2W-W;AJAX;12.18\nAJ-SOLOBUTTON-2G-B;AJAX;13.74\nAJ-SOLOBUTTON-2G-FOG;AJAX;13.74\nAJ-SOLOBUTTON-2G-GRA;AJAX;13.74\nAJ-SOLOBUTTON-2G-GRE;AJAX;13.74\nAJ-SOLOBUTTON-2G-IVO;AJAX;13.74\nAJ-SOLOBUTTON-2G-OLI;AJAX;13.74\nAJ-SOLOBUTTON-2G-OYS;AJAX;13.74\nAJ-SOLOBUTTON-2G-W;AJAX;13.74\nAJ-SOLOBUTTON-DIMMER-B;AJAX;48.78\nAJ-SOLOBUTTON-DIMMER-W;AJAX;48.78\nAJ-SOLOCOVER-B;AJAX;14.5\nAJ-SOLOCOVER-CP-W;AJAX;8.32\nAJ-SOLOCOVER-FOG;AJAX;14.5\nAJ-SOLOCOVER-GRA;AJAX;14.5\nAJ-SOLOCOVER-GRE;AJAX;14.5\nAJ-SOLOCOVER-IVO;AJAX;14.5\nAJ-SOLOCOVER-LAN-B;AJAX;9.08\nAJ-SOLOCOVER-LAN-W;AJAX;9.08\nAJ-SOLOCOVER-OLI;AJAX;14.5\nAJ-SOLOCOVER-OYS;AJAX;14.5\nAJ-SOLOCOVER-SMART-B;AJAX;23.66\nAJ-SOLOCOVER-SMART-FOG;AJAX;23.66\nAJ-SOLOCOVER-SMART-GRA;AJAX;23.66\nAJ-SOLOCOVER-SMART-GRE;AJAX;23.66\nAJ-SOLOCOVER-SMART-IVO;AJAX;23.66\nAJ-SOLOCOVER-SMART-OLI;AJAX;23.66\nAJ-SOLOCOVER-SMART-OYS;AJAX;22.96\nAJ-SOLOCOVER-SMART-W;AJAX;23.66\nAJ-SOLOCOVER-W;AJAX;14.5\nAJ-SPACECONTROL-B;AJAX;38.76\nAJ-SPACECONTROL-B-DUMMY;AJAX;6\nAJ-SPACECONTROL-W;AJAX;38.76\nAJ-SPACECONTROL-W-DUMMY;AJAX;6\nAJ-SPEAKERPHONE-B;AJAX;222.24\nAJ-SPEAKERPHONE-W;AJAX;222.24\nAJ-SPEAKERSS-B;AJAX;24\nAJ-STARTERKIT-CAM-HDR-4G-W;AJAX;620\nAJ-STARTERKIT-CAM-HDR-W;AJAX;540.6\nAJ-STARTERKIT-CAM-MP-B;AJAX;558\nAJ-STARTERKIT-CAM-MP-W;AJAX;558\nAJ-STARTERKIT-CAM-W;AJAX;530\nAJ-STARTERKITPLUS-CAM-HDR-W;AJAX;744.6\nAJ-STORAGE-ECONOMY-30DAY;AJAX;0\nAJ-STORAGE-ECONOMY-30DAY-4CAM;AJAX;0\nAJ-STORAGE-ECONOMY-7DAY;AJAX;0\nAJ-STORAGE-ECONOMY-7DAY-4CAM;AJAX;0\nAJ-STORAGE-PREMIUM-30DAY;AJAX;0\nAJ-STORAGE-PREMIUM-30DAY-4CAM;AJAX;0\nAJ-STORAGE-PREMIUM-7DAY;AJAX;0\nAJ-STORAGE-PREMIUM-7DAY-4CAM;AJAX;0\nAJ-STORAGE-STANDARD-30DAY;AJAX;0\nAJ-STORAGE-STANDARD-30DAY-4CAM;AJAX;0\nAJ-STORAGE-STANDARD-7DAY;AJAX;0\nAJ-STORAGE-STANDARD-7DAY-4CAM;AJAX;0\nAJ-STOTEM-W;AJAX;1000\nAJ-STREETSIREN-B;AJAX;155.04\nAJ-STREETSIREN-W;AJAX;155.04\nAJ-STREETSIREN-W-DUMMY;AJAX;56.6\nAJ-STREETSIRENCUSTOM-B;AJAX;155.04\nAJ-STREETSIRENCUSTOM-W;AJAX;155.04\nAJ-STREETSIRENCUSTOMS-W-DUMMY;AJAX;60\nAJ-SUITCASE-INTRUSION-BMC-003;AJAX;272.72\nAJ-SUITCASE-VIDEO-BMC-005;AJAX;272.72\nAJ-SURFACEBOX-W;AJAX;18.4\nAJ-TRANSMITTER;AJAX;61.2\nAJ-TSHIRT-2XL;AJAX;50\nAJ-TSHIRT-L;AJAX;50\nAJ-TSHIRT-M;AJAX;50\nAJ-TSHIRT-S;AJAX;50\nAJ-TSHIRT-XL;AJAX;23\nAJ-TURRETCAM-4-HLVF-S-B;AJAX;482.46\nAJ-TURRETCAM-4-HLVF-S-W;AJAX;482.46\nAJ-TURRETCAM-5-0400-B;AJAX;245.6\nAJ-TURRETCAM-5-0400-HL-B;AJAX;254.92\nAJ-TURRETCAM-5-0400-HL-W;AJAX;254.92\nAJ-TURRETCAM-5-0400-W;AJAX;245.6\nAJ-TURRETCAM-5-B;AJAX;245.6\nAJ-TURRETCAM-5-HL-B;AJAX;254.92\nAJ-TURRETCAM-5-HL-W;AJAX;254.92\nAJ-TURRETCAM-5-HLVF-B;AJAX;348.44\nAJ-TURRETCAM-5-HLVF-W;AJAX;348.44\nAJ-TURRETCAM-5-W;AJAX;245.6\nAJ-TURRETCAM-8-0400-B;AJAX;327.5\nAJ-TURRETCAM-8-0400-HL-B;AJAX;339.92\nAJ-TURRETCAM-8-0400-HL-W;AJAX;339.92\nAJ-TURRETCAM-8-0400-W;AJAX;327.5\nAJ-TURRETCAM-8-B;AJAX;327.5\nAJ-TURRETCAM-8-HL-B;AJAX;339.92\nAJ-TURRETCAM-8-HL-W;AJAX;339.92\nAJ-TURRETCAM-8-HLVF-B;AJAX;482.46\nAJ-TURRETCAM-8-HLVF-S-B;AJAX;616.48\nAJ-TURRETCAM-8-HLVF-S-W;AJAX;616.48\nAJ-TURRETCAM-8-HLVF-W;AJAX;482.46\nAJ-TURRETCAM-8-W;AJAX;327.5\nAJ-UARTBRIDGE;AJAX;44.88\nAJ-VHFBRIDGE-W;AJAX;154.94\nAJ-WALLSWITCH-B;AJAX;55.62\nAJ-WATERSTOP-1-B;AJAX;305.64\nAJ-WATERSTOP-1-W;AJAX;305.64\nAJ-WATERSTOP-1/2-B;AJAX;231.66\nAJ-WATERSTOP-1/2-W;AJAX;231.66\nAJ-WATERSTOP-3/4-B;AJAX;260.38\nAJ-WATERSTOP-3/4-W;AJAX;260.38\nHD1TB;wester;236.00\nHD2TB;wester;360.00\n;;\nHD4TB;wester;430.00\nHD6TB;wester;610.00\nHD8TB;wester;778.00\nVDMS105GP;;39.37\nVDMS108GP;;49.22\nINJ-POE-30W-V2;;21.6\nHS-TF-D3STD/64G/NEO LUX/WW;;39.00\nHS-TF-D3STD/32G/NEO LUX/WW;;26.00\nHS-TF-C1STD-128G;;70.00\nABE-150 BARRERA;;78.00\n";
let productos = [];
let lineas = [];
let seleccionado = null;
let activeIndex = -1;
let recientesSesion = [];
let catalogTerm = "";
const $ = (q) => document.querySelector(q);
const fmt = new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'});

function leerJSON(key, fallback){ try{ return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }catch(e){ return fallback; } }
function escribirJSON(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function siguienteNumero(soloVer=false){
  const year = new Date().getFullYear();
  let data = leerJSON(STORAGE_CONTADOR, {year, n:1});
  if(data.year !== year) data = {year, n:1};
  const numero = `HA-${year}-${String(data.n).padStart(4,'0')}`;
  if(!soloVer){ data.n += 1; escribirJSON(STORAGE_CONTADOR, data); }
  return numero;
}
function asegurarNumero(){ if(!($('#numero').value||'').trim()) $('#numero').value = siguienteNumero(false); return $('#numero').value; }
function findProductoByQuery(q){
  const t = normaliza(q);
  return productos.find(p => normaliza(p.name) === t) || productos.find(p => normaliza(p.name).includes(t)) || buscar(q)[0]?.p || null;
}
function descuentoActual(){ return Math.max(0, Math.min(100, Number($('#dtoGeneral')?.value)||0)); }
function aplicarDescuentoGeneralALineas(){
  const d = descuentoActual();
  lineas.forEach(l => l.dto = d);
  render();
}
let hxScrollPendiente = 0;
function hxBajarUltimaLineaPresupuesto(){
  clearTimeout(hxScrollPendiente);
  hxScrollPendiente = setTimeout(()=>{
    const scroller = document.querySelector('.budget-card .table-scroll') || document.querySelector('.table-scroll');
    if(!scroller) return;
    const ejecutar = ()=>{
      const ultima = scroller.querySelector('tbody tr:last-child');
      if(!ultima) return;
      try{ scroller.scrollTo({top:scroller.scrollHeight, behavior:'smooth'}); }
      catch(e){ scroller.scrollTop = scroller.scrollHeight; }
      ultima.classList.remove('hx-linea-recien-anadida');
      void ultima.offsetWidth;
      ultima.classList.add('hx-linea-recien-anadida');
      try{ ultima.scrollIntoView({behavior:'smooth', block:'nearest', inline:'nearest'}); }catch(e){}
      setTimeout(()=>ultima.classList.remove('hx-linea-recien-anadida'), 1100);
    };
    requestAnimationFrame(()=>requestAnimationFrame(ejecutar));
  }, 30);
}

function addProductoObj(p, qty=1, dto=null){
  if(!p) return false;
  lineas.push({name:p.name, brand:p.brand||'', pvp:p.pvp, qty:Math.max(1,Number(qty)||1), dto:dto===null ? descuentoActual() : (Number(dto)||0)});
  registrarReciente(p.name);
  hxBajarUltimaLineaPresupuesto();
  return true;
}

function normaliza(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }

function busquedaForzada(term){
  const t = normaliza(term).trim();
  const mapa = {
    'rele':['relay'], 'reles':['relay'], 'relé':['relay'], 'relés':['relay'],
    'sirena':['homesiren','streetsiren'], 'sirenas':['homesiren','streetsiren'],
    'grabador':['nvr'], 'grabadores':['nvr'], 'videograbador':['nvr'], 'videograbadores':['nvr'],
    'camara':['bulletcam','domecam','turretcam','indoorcam','doorbell'],
    'camaras':['bulletcam','domecam','turretcam','indoorcam','doorbell'],
    'cámara':['bulletcam','domecam','turretcam','indoorcam','doorbell'],
    'cámaras':['bulletcam','domecam','turretcam','indoorcam','doorbell'],
    'fuente':['psu','dc12','dc1224','ac220'], 'fuentes':['psu','dc12','dc1224','ac220'],
    'alimentador':['psu','dc12','dc1224','ac220'], 'alimentadores':['psu','dc12','dc1224','ac220'],
    'soporte':['mountcam','bracket','holder'], 'soportes':['mountcam','bracket','holder'],
    'caja':['junctionbox','surfacebox'], 'cajas':['junctionbox','surfacebox'],
    'fuga':['leaksprotect','waterstop'], 'fugas':['leaksprotect','waterstop'],
    'inundacion':['leaksprotect','waterstop'], 'inundaciones':['leaksprotect','waterstop'],
    'motion':['motionprotect','motioncam','outdoorprotect','curtainprotect','curtainoutdoor','dualcurtain'],
    'movimiento':['motionprotect','motioncam','outdoorprotect','curtainprotect','curtainoutdoor','dualcurtain']
  };
  const claves = mapa[t];
  if(!claves) return null;
  return productos
    .map((p,i)=>({p,i,n:normaliza(p.name)}))
    .filter(x=>claves.some(k=>x.n.includes(k)))
    .filter(x=>!/(dummy|lens|hood|bracket|repairkit)/i.test(x.p.name||''))
    .map(x=>({p:x.p,i:x.i,score:9999}))
    .sort((a,b)=>{
      if(t==='motion' || t==='movimiento'){
        const rank=n=> n.includes('motionprotect')&&!n.includes('plus') ? 0 : n.includes('motionprotectplus') ? 1 : n.includes('motioncam-hdr')&&!n.includes('phod') ? 2 : n.includes('motioncam-hdr-phod') ? 3 : n.includes('motioncamoutdoor') ? 4 : n.includes('curtain') ? 5 : 9;
        const d=rank(a.n)-rank(b.n); if(d) return d;
      }
      return a.p.name.localeCompare(b.p.name,'es');
    });
}

function numero(v){
  if(typeof v === 'number') return v;
  const s = String(v||'').replace(/€/g,'').replace(/\s/g,'').replace(/\.(?=\d{3}(\D|$))/g,'').replace(',', '.');
  const n = parseFloat(s); return Number.isFinite(n) ? n : 0;
}
function splitCSVLine(line, sep){
  const out=[]; let cur='', q=false;
  for(let i=0;i<line.length;i++){
    const c=line[i], n=line[i+1];
    if(c==='"' && q && n==='"'){ cur+='"'; i++; continue; }
    if(c==='"'){ q=!q; continue; }
    if(c===sep && !q){ out.push(cur.trim()); cur=''; continue; }
    cur+=c;
  }
  out.push(cur.trim()); return out;
}
function parseCSV(txt){
  txt = txt.replace(/^\uFEFF/,'').trim();
  const lines = txt.split(/\r?\n/).filter(l=>l.trim());
  if(!lines.length) return [];
  const sep = (lines[0].match(/;/g)||[]).length >= (lines[0].match(/,/g)||[]).length ? ';' : ',';
  let header = splitCSVLine(lines[0], sep).map(h=>normaliza(h).replace(/[^a-z0-9]/g,''));
  let start = 1;
  const hasHeader = header.some(h => ['name','nombre','producto','descripcion','brand','marca','pvp','precio'].includes(h));
  if(!hasHeader){ header = ['name','brand','pvp']; start = 0; }
  const idxName = header.findIndex(h=>['name','nombre','producto','descripcion','referencia','codigo'].includes(h));
  const idxBrand = header.findIndex(h=>['brand','marca','fabricante'].includes(h));
  const idxPvp = header.findIndex(h=>['pvp','precio','price','importe'].includes(h));
  return lines.slice(start).map(line=>{
    const c = splitCSVLine(line, sep);
    const name = c[idxName>=0?idxName:0] || '';
    const brand = c[idxBrand>=0?idxBrand:1] || '';
    const pvp = numero(c[idxPvp>=0?idxPvp:2]);
    return {name:name.trim(), brand:brand.trim(), pvp};
  }).filter(p=>p.name && p.pvp>=0).sort((a,b)=>a.name.localeCompare(b.name,'es'));
}

async function cargarCatalogoLegacyInterno(){
  let origen = 'csv';
  try{
    const r = await fetch(`${CSV_URL}?v=${Date.now()}`, {cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    productos = parseCSV(await r.text());
    if(!productos.length) throw new Error('CSV vacío o columnas no reconocidas');
  }catch(e){
    // Si se abre con doble clic, algunos navegadores bloquean fetch().
    // Para que la herramienta siga funcionando, usamos la copia interna incluida en app.js.
    productos = parseCSV(CSV_INTERNO);
    origen = 'interno';
  }
  if(!productos.length){
    $('#previewProducto').textContent = '0 productos cargados.';
  }else{
    $('#previewProducto').textContent = `${productos.length} productos cargados.`;
  }
  cargarSelect();
  renderRecientes();
  pintarResultados('');
}

function cargarSelect(){
  const sel = $('#producto');
  sel.innerHTML = '<option value="">Elegir desde desplegable...</option>' + productos.map((p,i)=>`<option value="${i}">${escapeHtml(p.name)}</option>`).join('');
  pintarCatalogPanel('');
}


const APP_VERSION = 'v1.9.5 PRO';
const AJAX_KNOWLEDGE = [{"n":"StarterKit","f":"Kits básicos","d":"Kit con Hub, MotionProtect, DoorProtect y SpaceControl"},{"n":"StarterKit (4G)","f":"Kits básicos","d":"Kit con Hub 2 (4G), MotionProtect, DoorProtect y SpaceControl"},{"n":"StarterKit 2","f":"Kits básicos","d":"Kit con Hub 2 (2G), MotionProtect, DoorProtect y SpaceControl"},{"n":"StarterKit Cam","f":"Kits básicos","d":"Kit con Hub 2 (2G), MotionCam, DoorProtect y SpaceControl"},{"n":"StarterKit Cam Plus","f":"Kits básicos","d":"Kit con Hub 2 Plus, MotionCam, DoorProtect y SpaceControl"},{"n":"StarterKit Plus","f":"Kits básicos","d":"Kit con Hub Plus, MotionProtect, DoorProtect y SpaceControl"},{"n":"EN54 Fire Hub Jeweller","f":"Hubs","d":"ECI inalámbrico para un sistema de alarma contra incendios, que admite dispositivos de protección contra intrusiones"},{"n":"Hub (2G) Jeweller","f":"Hubs","d":"Panel de control inalámbrico. Admite Ethernet y una tarjeta SIM (2G)"},{"n":"Hub (4G) Jeweller","f":"Hubs","d":"Panel de control inalámbrico. Admite Ethernet y una tarjeta SIM (LTE)"},{"n":"Hub 2 (2G) Jeweller","f":"Hubs","d":"Panel de control inalámbrico con soporte para la fotoverificación. Admite Ethernet y dos tarjetas SIM (2G)"},{"n":"Hub 2 (4G) Jeweller","f":"Hubs","d":"Panel de control inalámbrico con soporte para la fotoverificación. Admite Ethernet y dos tarjetas SIM (2G/3G/LTE)"},{"n":"Hub 2 Plus Jeweller","f":"Hubs","d":"Panel de control inalámbrico con soporte para la fotoverificación. Admite Wi-Fi, Ethernet y dos tarjetas SIM (2G/3G/LTE)"},{"n":"Hub BP Jeweller","f":"Hubs","d":"Panel de control inalámbrico alimentado por batería. Admite la verificación fotográfica. Se conecta mediante dos tarjetas SIM (2G/3G/LTE)."},{"n":"Hub BP Jeweller (without casing)","f":"Hubs","d":"Panel de control inalámbrico alimentado por batería diseñado para su instalación en una carcasa Ajax. Admite verificación fotográfica. Se conecta mediante dos tarjetas SIM (2G/3G/LTE)."},{"n":"Superior Hub G3 Jeweller","f":"Hubs","d":"Panel de control inalámbrico con soporte para fotoverificación. Puede conectarse a través de Ethernet, Wi-Fi y dos tarjetas SIM (2G/LTE)."},{"n":"Superior Hub Hybrid (2G)","f":"Hubs","d":"Panel de control híbrido con soporte para la fotoverificación. Funciona con dispositivos Fibra y Jeweller. Admite Ethernet y dos tarjetas SIM (2G)"},{"n":"Superior Hub Hybrid (4G)","f":"Hubs","d":"Panel de control híbrido con soporte para la fotoverificación. Funciona con dispositivos Fibra y Jeweller. Admite Ethernet y dos tarjetas SIM (2G/3G/LTE)"},{"n":"Superior Hub Hybrid (4G) (without casing)","f":"Hubs","d":"Panel de control híbrido diseñado para su instalación en la Case D. Funciona con dispositivos Fibra y Jeweller. Puede conectarse a través de Ethernet y dos tarjetas SIM (2G/3G/LTE)."},{"n":"Superior Hub Hybrid 2","f":"Hubs","d":"Panel de control híbrido para instalaciones medianas y grandes. Funciona con hasta 250 dispositivos Fibra y Jeweller. Puede conectarse a través de Ethernet y dos tarjetas SIM (2G/3G/LTE)."},{"n":"Superior Hub Hybrid 2 (without casing)","f":"Hubs","d":"Panel de control híbrido para instalaciones medianas y grandes. Diseñado para su instalación en una carcasa Ajax compatible. Funciona con hasta 250 dispositivos Fibra y Jeweller. Puede conectarse a través de Ethernet y dos tarjetas SIM (2G/3G/LTE)."},{"n":"Superior MegaHub","f":"Hubs","d":"Panel de control híbrido para los proyectos más grandes. Funciona con hasta 999 dispositivos Fibra y Jeweller. Puede conectarse a través de Ethernet, Wi-Fi y dos tarjetas SIM (2G/LTE)."},{"n":"Superior MegaHub (without casing)","f":"Hubs","d":"Panel de control híbrido para los proyectos más grandes. Diseñado para su instalación en una carcasa Ajax compatible. Funciona con hasta 999 dispositivos Fibra y Jeweller. Puede conectarse a través de Ethernet, Wi-Fi y dos tarjetas SIM (2G/LTE)."},{"n":"EN54 Fire ReX Jeweller","f":"Repetidores de señal","d":"Repetidor de señal de radio inalámbrico direccionable para un sistema de alarma contra incendios. Admite dispositivos de protección contra intrusiones"},{"n":"ReX 2 Jeweller","f":"Repetidores de señal","d":"Repetidor de señal de radio inalámbrico que admite los protocolos Jeweller y Wings"},{"n":"ReX Jeweller","f":"Repetidores de señal","d":"Repetidor de señal de radio inalámbrico"},{"n":"Superior ReX G3 Jeweller","f":"Repetidores de señal","d":"Repetidor de señal de radio inalámbrico con soporte para la fotoverificación y conexión Ethernet"},{"n":"DoorProtect Jeweller","f":"Detectores de apertura","d":"Detector inalámbrico de apertura con relé reed"},{"n":"DoorProtect Plus Jeweller","f":"Detectores de apertura","d":"Detector inalámbrico y combinado de apertura, impacto e inclinación con relé reed y acelerómetro"},{"n":"Superior DoorProtect Fibra","f":"Detectores de apertura","d":"Detector cableado de apertura para interiores"},{"n":"Superior DoorProtect Plus Fibra","f":"Detectores de apertura","d":"Detector cableado de apertura con sensores de impacto e inclinación"},{"n":"Superior DoorProtect G3 Fibra","f":"Detectores de apertura","d":"Detector de apertura con sensores de impacto, inclinación y enmascaramiento magnético"},{"n":"Superior DoorProtect G3 Jeweller","f":"Detectores de apertura","d":"Detector inalámbrico de apertura con relé reed y sensores de impacto, inclinación y enmascaramiento"},{"n":"Superior DoorProtect Jeweller","f":"Detectores de apertura","d":"Detector inalámbrico de apertura con dos relés reed. Versión Superior"},{"n":"Superior DoorProtect Plus Jeweller","f":"Detectores de apertura","d":"Detector inalámbrico y combinado de apertura, impacto e inclinación con dos relés reed y acelerómetro. Versión Superior"},{"n":"GlassProtect Jeweller","f":"Detectores de rotura de cristal","d":"Detector inalámbrico de rotura de cristal con micrófono"},{"n":"Superior GlassProtect Fibra","f":"Detectores de rotura de cristal","d":"Detector cableado de rotura de cristal con micrófono"},{"n":"Superior GlassProtect Jeweller","f":"Detectores de rotura de cristal","d":"Detector inalámbrico de rotura de cristal con micrófono. Versión Superior"},{"n":"CombiProtect Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento y de rotura de cristal con micrófono"},{"n":"Curtain Outdoor Jeweller","f":"Detectores de movimiento","d":"Detector inalámbrico de movimiento tipo cortina de doble tecnología para exteriores e interiores"},{"n":"DualCurtain Outdoor Jeweller","f":"Detectores de movimiento","d":"Detector IR inalámbrico y bidireccional de movimiento tipo cortina"},{"n":"MotionCam (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con posibilidades ampliadas de verificación fotográfica"},{"n":"MotionCam Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento que admite la función de foto por alarma"},{"n":"MotionCam Outdoor HighMount (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con posibilidades ampliadas de verificación fotográfica. Para instalación en exteriores a una altura de 2–4 m."},{"n":"MotionCam Outdoor Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento que toma fotos por alarma. Para exteriores e interiores"},{"n":"MotionProtect Curtain Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento tipo cortina"},{"n":"MotionProtect Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento"},{"n":"MotionProtect Plus Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento con sensor de microondas de banda K adicional"},{"n":"Superior CombiProtect Fibra","f":"Detectores de movimiento","d":"Detector IR cableado y combinado de movimiento y de rotura de cristal con micrófono"},{"n":"Superior CombiProtect Jeweller","f":"Detectores de movimiento","d":"Detector IR inalámbrico y combinado de movimiento y de rotura de cristal con micrófono. Versión Superior"},{"n":"Superior MotionCam (PhOD) Fibra","f":"Detectores de movimiento","d":"Detector PIR y cableado de movimiento con posibilidades ampliadas de verificación fotográfica"},{"n":"Superior MotionCam (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con posibilidades ampliadas de verificación fotográfica"},{"n":"Superior MotionCam AM (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con un sistema antienmascaramiento y posibilidades ampliadas de verificación fotográfica. Admite resolución HD."},{"n":"Superior MotionCam Fibra","f":"Detectores de movimiento","d":"Detector IR y cableado de movimiento que admite la función de foto por alarma"},{"n":"Superior MotionCam HD (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con posibilidades ampliadas de verificación fotográfica. Admite resolución HD."},{"n":"Superior MotionProtect Fibra","f":"Detectores de movimiento","d":"Detector IR y cableado de movimiento"},{"n":"Superior MotionProtect G3 Fibra","f":"Detectores de movimiento","d":"Detector PIR y cableado de movimiento con un sistema antienmascaramiento"},{"n":"Superior MotionProtect Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento. Versión Superior"},{"n":"Superior MotionProtect Plus Fibra","f":"Detectores de movimiento","d":"Detector IR y cableado de movimiento con sensor de microondas de banda K adicional"},{"n":"Superior MotionProtect Plus G3 Fibra","f":"Detectores de movimiento","d":"Detector IR y cableado de movimiento con un sensor de microondas de banda K adicional y sistema antienmascaramiento"},{"n":"Superior MotionProtect Plus Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento con sensor de microondas de banda K adicional. Versión Superior"},{"n":"Curtain Outdoor Mini Jeweller","f":"Detectores de movimiento","d":"Detector inalámbrico de movimiento tipo cortina de doble tecnología para exteriores e interiores"},{"n":"CurtainCam Outdoor HighMount (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector inalámbrico de movimiento tipo cortina de doble tecnología con posibilidades ampliadas de verificación fotográfica. Para instalación en exteriores a una altura de 2–4 m."},{"n":"MotionCam Outdoor (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con posibilidades ampliadas de verificación fotográfica. Para exteriores e interiores"},{"n":"MotionProtect Outdoor Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento para exteriores e interiores"},{"n":"Superior MotionCam G3 (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con posibilidades ampliadas de verificación fotográfica. Admite resolución HD."},{"n":"Superior MotionProtect G3 Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con sistema antienmascaramiento"},{"n":"Superior MotionProtect Plus G3 Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con un sensor de microondas de banda K adicional y sistema antienmascaramiento"},{"n":"Superior SeismoProtect G3 Fibra","f":"Detectores sísmicos","d":"Detector sísmico cableado con un sensor de impacto adicional"},{"n":"HomeSiren Jeweller","f":"Sirenas","d":"Sirena inalámbrica"},{"n":"StreetSiren DoubleDeck Jeweller","f":"Sirenas","d":"Sirena inalámbrica con un soporte para un panel frontal personalizable"},{"n":"StreetSiren Jeweller","f":"Sirenas","d":"Sirena inalámbrica para interiores y exteriores"},{"n":"Superior HomeSiren Fibra","f":"Sirenas","d":"Sirena cableada con conector LED"},{"n":"Superior HomeSiren G3 Jeweller","f":"Sirenas","d":"Sirena inalámbrica con protección antisabotaje avanzada y conector LED"},{"n":"Superior HomeSiren Jeweller","f":"Sirenas","d":"Sirena inalámbrica. Versión Superior"},{"n":"Superior StreetSiren DoubleDeck Fibra","f":"Sirenas","d":"Sirena cableada con un soporte para un panel frontal personalizable"},{"n":"Superior StreetSiren DoubleDeck Jeweller","f":"Sirenas","d":"Sirena inalámbrica con un soporte para un panel frontal personalizable. Versión Superior"},{"n":"Superior StreetSiren Fibra","f":"Sirenas","d":"Sirena cableada para interiores y exteriores"},{"n":"Superior StreetSiren Plus Fibra","f":"Sirenas","d":"Sirena cableada con protección antisabotaje avanzada y una lista ampliada de certificados de cumplimiento. Para exteriores e interiores."},{"n":"Superior StreetSiren Plus G3 Jeweller","f":"Sirenas","d":"Sirena inalámbrica con protección antisabotaje avanzada y una lista ampliada de certificados de cumplimiento. Para exteriores e interiores."},{"n":"Superior StreetSiren Plus Jeweller","f":"Sirenas","d":"Sirena inalámbrica con protección antisabotaje avanzada y una lista ampliada de certificados de cumplimiento. Para exteriores e interiores."},{"n":"Ajax SpaceControl Jeweller","f":"Botones y mandos","d":"Mando inalámbrico con botón de pánico y control de los modos de seguridad"},{"n":"Ajax Superior SpaceControl Jeweller","f":"Botones y mandos","d":"Mando inalámbrico con botón de pánico y control de los modos de seguridad. Versión Superior"},{"n":"Button Jeweller","f":"Botones y mandos","d":"Botón de pánico inalámbrico / botón inteligente"},{"n":"DoubleButton Jeweller","f":"Botones y mandos","d":"Botón de emergencia inalámbrico"},{"n":"Superior Button Jeweller","f":"Botones y mandos","d":"Botón de pánico/botón inteligente e inalámbrico. Versión Superior"},{"n":"Superior DoubleButton G3 Jeweller","f":"Botones y mandos","d":"Botón inalámbrico de emergencia para instalaciones de alto riesgo"},{"n":"SpeakerPhone Jeweller","f":"Módulos de voz","d":"Módulo de voz inalámbrico para la verificación de alarmas"},{"n":"KeyPad Jeweller","f":"Teclados","d":"Teclado inalámbrico y táctil"},{"n":"KeyPad Plus Jeweller","f":"Teclados","d":"Teclado inalámbrico y táctil compatible con tarjetas y mandos cifrados sin contacto"},{"n":"Superior KeyPad Fibra","f":"Teclados","d":"Teclado cableado y táctil"},{"n":"KeyPad Outdoor Jeweller","f":"Teclados","d":"Teclado inalámbrico que admite la autenticación mediante Pass, Tag, smartphones y códigos. Para exteriores e interiores."},{"n":"KeyPad TouchScreen Jeweller","f":"Teclados","d":"Teclado inalámbrico con pantalla táctil que admite la autenticación con smartphones, Pass, Tag y códigos"},{"n":"Superior KeyPad Outdoor Fibra","f":"Teclados","d":"Teclado cableado para exteriores e interiores que admite la autenticación mediante Pass, Tag, smartphones y códigos"},{"n":"Superior KeyPad Plus G3 Jeweller","f":"Teclados","d":"Teclado inalámbrico con botones táctiles que admite la autenticación mediante Pass, Tag y códigos"},{"n":"Superior KeyPad Plus Jeweller","f":"Teclados","d":"Teclado inalámbrico y táctil compatible con tarjetas y mandos cifrados sin contacto. Versión Superior"},{"n":"Superior KeyPad TouchScreen Fibra","f":"Teclados","d":"Teclado cableado con pantalla táctil y autorización sin contacto"},{"n":"Superior KeyPad TouchScreen G3 Jeweller","f":"Teclados","d":"Teclado inalámbrico con pantalla táctil que admite la autenticación mediante Pass, Tag, smartphones y códigos"},{"n":"Ajax Superior BulletCam HLVF (4 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal P-Iris motorizado de 2.8–12 mm, iluminación híbrida, True WDR, micrófono y altavoz integrados, entradas/salidas de audio y alarma y PoE/12 V. Para exteriores e interiores."},{"n":"Ajax Superior TurretCam HLVF (4 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal P-Iris motorizado de 2.8–12 mm, iluminación híbrida, True WDR, micrófono y altavoz integrados, entradas/salidas de audio y alarma y PoE/12 V. Para exteriores e interiores."},{"n":"Ajax Superior TurretCam HLVF (8 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal P-Iris motorizado de 2.8–12 mm, iluminación híbrida, True WDR, micrófono y altavoz integrados, entradas/salidas de audio y alarma y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam HL (5 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam HL (5 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam HL (8 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam HL (8 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini (5 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini (5 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini (8 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini (8 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini HL (5 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini HL (5 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini HL (8 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini HL (8 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam (5 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam (5 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam (8 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam (8 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam HL (5 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam HL (5 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam HL (8 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam HL (8 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"Ajax Superior BulletCam HLVF (8 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal P-Iris motorizado de 2.8–12 mm, iluminación híbrida, True WDR, micrófono y altavoz integrados, entradas/salidas de audio y alarma y PoE/12 V. Para exteriores e interiores."},{"n":"Ajax Superior DomeCam HLVF (4 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal P-Iris motorizado de 2.8–12 mm, iluminación híbrida, True WDR, micrófono y altavoz integrados, entradas/salidas de audio y alarma y PoE/12 V. Para exteriores e interiores."},{"n":"Ajax Superior DomeCam HLVF (8 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal P-Iris motorizado de 2.8–12 mm, iluminación híbrida, True WDR, micrófono y altavoz integrados, entradas/salidas de audio y alarma y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam (5 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam (5 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam (8 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam (8 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam HLVF (5 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal motorizado de 2.8–12 mm, iluminación híbrida, True WDR, entradas/salidas de audio y alarma, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam HLVF (8 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal motorizado de 2.8–12 mm, iluminación híbrida, True WDR, entradas/salidas de audio y alarma, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam HLVF (5 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal motorizado de 2.8–12 mm, iluminación híbrida, True WDR, entradas/salidas de audio y alarma, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam HLVF (8 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal motorizado de 2.8–12 mm, iluminación híbrida, True WDR, entradas/salidas de audio y alarma, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam HLVF (5 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal motorizado de 2.8–12 mm, iluminación híbrida, True WDR, entradas/salidas de audio y alarma, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam HLVF (8 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal motorizado de 2.8–12 mm, iluminación híbrida, True WDR, entradas/salidas de audio y alarma, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"IndoorCam","f":"Cámaras Wi-Fi","d":"Cámara de seguridad Wi-Fi para interiores con sensor de movimiento PIR e IA integrada"},{"n":"DoorBell","f":"Timbres","d":"Vídeo timbre con IA integrada, sensor PIR y control a través de apps"},{"n":"Ajax Superior NVR H2DAI16PAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con IA, salida HDMI 4K, interfaz Gigabit Ethernet, 16 puertos PoE y soporte para 2 discos duros sustituibles en caliente"},{"n":"Ajax Superior NVR H2DAI16PAC (32-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 32 canales con IA, salida HDMI 4K, interfaz Gigabit Ethernet, 16 puertos PoE y soporte para 2 discos duros sustituibles en caliente"},{"n":"Ajax Superior NVR H2DAI8PAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con IA, salida HDMI 4K, interfaz Gigabit Ethernet, ocho puertos PoE y soporte para dos discos duros sustituibles en caliente"},{"n":"Ajax Superior NVR H2DAI8PAC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales con IA, salida HDMI 4K, interfaz Gigabit Ethernet, ocho puertos PoE y soporte para dos discos duros sustituibles en caliente"},{"n":"NVR (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales"},{"n":"NVR (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales"},{"n":"NVR DC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red para 16 canales alimentado por una fuente de energía de baja tensión"},{"n":"NVR DC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red para 8 canales alimentado por una fuente de energía de baja tensión"},{"n":"NVR H2D16PAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con salida HDMI 4K, 16 puertos PoE y soporte para 2 discos duros sustituibles en caliente"},{"n":"NVR H2D8PAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con salida HDMI 4K, ocho puertos PoE y soporte para 2 discos duros sustituibles en caliente"},{"n":"NVR H2D8PAC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales con salida HDMI 4K, ocho puertos PoE y soporte para 2 discos duros sustituibles en caliente"},{"n":"NVR H2DAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con salida HDMI 4K y soporte para 2 discos duros sustituibles en caliente"},{"n":"NVR H2DAC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales con salida HDMI 4K y soporte para 2 discos duros sustituibles en caliente"},{"n":"NVR HAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con salida HDMI"},{"n":"NVR HAC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales con salida HDMI"},{"n":"Ajax Superior NVR H2DAI2GAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con IA, salida HDMI 4K, 2 puertos Gigabit Ethernet y soporte para 2 discos duros sustituibles en caliente"},{"n":"Ajax Superior NVR H2DAI2GAC (32-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 32 canales con IA, salida HDMI 4K, 2 puertos Gigabit Ethernet y soporte para 2 discos duros sustituibles en caliente"},{"n":"Ajax Superior NVR H2DAI2GAC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales con IA, salida HDMI 4K, 2 puertos Gigabit Ethernet y soporte para 2 discos duros sustituibles en caliente"},{"n":"NVR HDC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con salida HDMI, alimentado por una fuente de energía de baja tensión"},{"n":"NVR HDC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales con salida HDMI, alimentado por una fuente de energía de baja tensión"},{"n":"EN54 FireProtect (Heat) Jeweller","f":"Detectores de incendio","d":"Detector de calor puntual inalámbrico direccionable"},{"n":"EN54 FireProtect (Heat/Smoke) Jeweller","f":"Detectores de incendio","d":"Detector de calor y de humo puntual inalámbrico direccionable"},{"n":"EN54 FireProtect (Heat/Sounder) Jeweller","f":"Detectores de incendio","d":"Detector de calor puntual inalámbrico direccionable combinado con una sirena de alarma de incendio"},{"n":"EN54 FireProtect (Smoke) Jeweller","f":"Detectores de incendio","d":"Detector de humo puntual inalámbrico direccionable"},{"n":"FireProtect 2 AC (CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio monóxido de carbono alimentado por la red eléctrica"},{"n":"FireProtect 2 AC (Heat) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio de calor alimentado por la red eléctrica"},{"n":"FireProtect 2 AC (Heat/CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio de calor y monóxido de carbono alimentado por la red eléctrica"},{"n":"FireProtect 2 AC (Heat/Smoke) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio de humo y calor alimentado por la red eléctrica"},{"n":"FireProtect 2 AC (Heat/Smoke/CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio de humo, calor y monóxido de carbono alimentado por la red eléctrica"},{"n":"FireProtect 2 RB (CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de CO con baterías reemplazables"},{"n":"FireProtect 2 RB (CO) UL Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio con sensor de CO. Versión con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de calor con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat) UL Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio con sensor de calor. Versión con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat/CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor y CO con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat/Smoke) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor y humo con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat/Smoke) UL Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor y humo con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat/Smoke/CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor, humo y CO con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat/Smoke/CO) UL Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor y humo con baterías reemplazables"},{"n":"FireProtect 2 SB (CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de CO con baterías integradas"},{"n":"FireProtect 2 SB (Heat) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de calor con baterías integradas"},{"n":"FireProtect 2 SB (Heat/CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor y CO con baterías integradas"},{"n":"FireProtect 2 SB (Heat/Smoke) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor y humo con baterías integradas"},{"n":"FireProtect 2 SB (Heat/Smoke/CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor, humo y CO con baterías integradas"},{"n":"FireProtect Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio con sensores de calor y humo. Versión con baterías reemplazables"},{"n":"FireProtect Plus Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor, humo y CO con baterías reemplazables"},{"n":"EN54 FireProtect (Smoke/Sounder) Jeweller","f":"Detectores de incendio","d":"Detector de humo puntual inalámbrico direccionable combinado con una sirena de alarma de incendio"},{"n":"EN54 FireProtect (Sounder) Jeweller","f":"Dispositivos de alarma de incendio","d":"Sirena de alarma de incendio inalámbrica direccionable"},{"n":"EN54 FireProtect (Sounder/VAD) Jeweller","f":"Dispositivos de alarma de incendio","d":"Sirena de alarma de incendio inalámbrica direccionable combinada con un Flash-dispositivo de alarma visual (DAV)"},{"n":"EN54 FireProtect (VAD) Jeweller","f":"Dispositivos de alarma de incendio","d":"Flash-dispositivo de alarma de incendio visual (DAV) inalámbrico y direccionable"},{"n":"ManualCallPoint (Blue) Jeweller","f":"Pulsadores manuales de alarma","d":"Botón inalámbrico reajustable y programable de color azul"},{"n":"ManualCallPoint (Green) Jeweller","f":"Pulsadores manuales de alarma","d":"Botón inalámbrico reajustable con escenarios programables. Versión de color verde."},{"n":"ManualCallPoint (Red) Jeweller","f":"Pulsadores manuales de alarma","d":"Botón inalámbrico reajustable para la activación manual de la alarma de incendio con escenarios programables. Versión de color rojo"},{"n":"ManualCallPoint (White) Jeweller","f":"Pulsadores manuales de alarma","d":"Botón inalámbrico reajustable con escenarios programables. Versión de color blanco."},{"n":"ManualCallPoint (Yellow) Jeweller","f":"Pulsadores manuales de alarma","d":"Botón inalámbrico reajustable con escenarios programables. Versión de color amarillo."},{"n":"LightSwitch (1-gang) [120] Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 1 banda"},{"n":"LightSwitch (1-gang) Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 1 banda"},{"n":"LightSwitch (2-gang) Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 2 bandas"},{"n":"LightSwitch (2-gang/2-way) Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 2 bandas y de 2 vías"},{"n":"LightSwitch (2-way) Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 2 vías"},{"n":"LightSwitch (3-way) [120] Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 3 vías"},{"n":"LightSwitch (4-way) [120] Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 4 vías"},{"n":"LightSwitch (Crossover) Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de cruce"},{"n":"LightSwitch (Dimmer) Jeweller","f":"Interruptores de luz","d":"Dimmer inteligente y táctil"},{"n":"CoverPlate","f":"Bases de enchufe","d":"Tapa de la caja de montaje"},{"n":"Outlet (basic) [type E]","f":"Bases de enchufe","d":"Base de enchufe con conexión a tierra"},{"n":"Outlet (basic) [type F]","f":"Bases de enchufe","d":"Base de enchufe con conexión a tierra"},{"n":"Outlet (LAN)","f":"Bases de enchufe","d":"Base de enchufe Ethernet con dos puertos"},{"n":"Outlet [type E] Jeweller","f":"Bases de enchufe","d":"Base de enchufe inteligente con monitor de consumo eléctrico"},{"n":"Outlet [type F] Jeweller","f":"Bases de enchufe","d":"Base de enchufe inteligente con monitor de consumo eléctrico"},{"n":"Socket (type B) Jeweller","f":"Enchufes inteligentes","d":"Enchufe inteligente con monitor de consumo eléctrico"},{"n":"Socket (type F) Jeweller","f":"Enchufes inteligentes","d":"Enchufe inteligente con monitor de consumo eléctrico"},{"n":"Socket (type G) Jeweller","f":"Enchufes inteligentes","d":"Enchufe inteligente con monitor de consumo eléctrico"},{"n":"Relay Jeweller","f":"Relés","d":"Relé inalámbrico de contacto seco"},{"n":"Superior MultiRelay Fibra","f":"Relés","d":"Relé de cuatro canales de control remoto"},{"n":"WallSwitch Jeweller","f":"Relés","d":"Relé de potencia para controlar la alimentación de 110/230 V~ en remoto"},{"n":"LifeQuality Jeweller","f":"Detectores de calidad del aire","d":"Monitor inalámbrico de temperatura, humedad y CO₂"},{"n":"LifeQuality Lite Jeweller","f":"Detectores de calidad del aire","d":"Monitor inalámbrico de temperatura y de humedad"},{"n":"LeaksProtect Jeweller","f":"Detectores de inundación","d":"Detector inalámbrico de inundación"},{"n":"Ajax WaterStop 1\" (DN 25) Jeweller","f":"Válvulas de cierre","d":"Válvula de cierre de agua inalámbrica de control remoto"},{"n":"Ajax WaterStop ½\" (DN 15) Jeweller","f":"Válvulas de cierre","d":"Válvula de cierre de agua inalámbrica de control remoto"},{"n":"Ajax WaterStop ¾\" (DN 20) Jeweller","f":"Válvulas de cierre","d":"Válvula de cierre de agua inalámbrica de control remoto"},{"n":"EN54 I/O Module (2X2) Jeweller","f":"Módulos de integración","d":"Módulo inalámbrico direccionable con dos entradas y dos salidas para un sistema de alarma contra incendios"},{"n":"MultiTransmitter Jeweller","f":"Módulos de integración","d":"Módulo inalámbrico para integrar hasta 18 dispositivos de terceros en el sistema Ajax"},{"n":"Superior MultiTransmitter Fibra","f":"Módulos de integración","d":"Módulo cableado para integrar hasta 18 dispositivos de terceros en un sistema Ajax"},{"n":"Superior MultiTransmitter Fibra (without casing)","f":"Módulos de integración","d":"Módulo cableado para integrar hasta 18 dispositivos de terceros en un sistema Ajax"},{"n":"Superior MultiTransmitter G3 Jeweller","f":"Módulos de integración","d":"Módulo inalámbrico para integrar hasta 18 dispositivos de terceros en un sistema Ajax"},{"n":"Superior MultiTransmitter G3 Jeweller (without casing)","f":"Módulos de integración","d":"Módulo inalámbrico para integrar hasta 18 dispositivos de terceros en un sistema Ajax. Diseñado para su instalación en una carcasa Ajax."},{"n":"Superior MultiTransmitter IO (4X4) Fibra","f":"Módulos de integración","d":"Módulo cableado con 4 entradas y 4 salidas. Diseñado para integrar dispositivos de terceros en un sistema Ajax"},{"n":"Superior Transmitter Fibra","f":"Módulos de integración","d":"Módulo cableado para integrar un dispositivo de terceros en el sistema Ajax"},{"n":"Transmitter Jeweller","f":"Módulos de integración","d":"Módulo inalámbrico para integrar un dispositivo de terceros en el sistema Ajax"},{"n":"vhfBridge Jeweller","f":"Módulos de integración","d":"Módulo inalámbrico para conectar un sistema Ajax a transmisores VHF de terceros"},{"n":"vhfBridge Jeweller (without casing)","f":"Módulos de integración","d":"Módulo inalámbrico para conectar un sistema Ajax a transmisores VHF de terceros"},{"n":"Superior LineProtect Fibra","f":"Accesorios Fibra","d":"Módulo de protección de los dispositivos en la línea Fibra contra el cortocircuito y el sabotaje"},{"n":"Superior LineSplit Fibra","f":"Accesorios Fibra","d":"Módulo para dividir una línea Fibra en cuatro líneas"},{"n":"Superior LineSupply (45 W) Fibra","f":"Accesorios Fibra","d":"Módulo para la alimentación adicional con una potencia de 45 W y una línea de salida Fibra"},{"n":"Superior LineSupply (75 W) Fibra","f":"Accesorios Fibra","d":"Módulo para la alimentación adicional con una potencia de 75 W y dos líneas de salida Fibra"},{"n":"Case A (106)","f":"Carcasas","d":"Carcasa para un módulo Ajax"},{"n":"Case B (175)","f":"Carcasas","d":"Carcasa para uno o dos módulos Fibra"},{"n":"Case C (260)","f":"Carcasas","d":"Carcasa para un módulo Ajax y una batería de 7 Ah"},{"n":"Case D (430)","f":"Carcasas","d":"Carcasa para hasta ocho módulos Ajax y dos baterías de 18 Ah"},{"n":"Case E (395)","f":"Carcasas","d":"Carcasa impermeable para un hub Ajax con batería interna. Para exteriores e interiores."},{"n":"12-24V PSU (type A)","f":"Fuentes de alimentación","d":"Fuente de alimentación para el funcionamiento del dispositivo con una alimentación de baja tensión"},{"n":"12V PSU for Hub/Hub Plus/ReX","f":"Fuentes de alimentación","d":"Fuente de alimentación para el funcionamiento del dispositivo con una alimentación de baja tensión"},{"n":"12V PSU for NVR","f":"Fuentes de alimentación","d":"Fuente de alimentación para el funcionamiento del NVR con una alimentación de baja tensión"},{"n":"6V PSU (type A)","f":"Fuentes de alimentación","d":"Fuente de alimentación para el funcionamiento del dispositivo con una batería portátil"}];
const KNOWLEDGE_STOPWORDS = new Set(['ajax','jeweller','fibra','superior','nuevo','proximamente','próximamente','type','dn','mp','ch','w','b','black','white','color','sin','casing','without','case','plus']);
const knowledgeCache = new Map();
function compactKnowledgeText(s){
  return normaliza(String(s||''))
    .replace(/ajax|jeweller|fibra|superior|new|nuevo|proximamente|próximamente/g,' ')
    .replace(/[^a-z0-9]+/g,'');
}
function knowledgeTokens(s){
  return normaliza(String(s||''))
    .replace(/ajax|jeweller|fibra|superior/g,' ')
    .split(/[^a-z0-9]+/)
    .filter(t => t && t.length>1 && !KNOWLEDGE_STOPWORDS.has(t));
}
function productoKnowledgeKey(p){ return (p && p.name) || ''; }
function conocimientoProducto(p){
  const key = productoKnowledgeKey(p);
  if(knowledgeCache.has(key)) return knowledgeCache.get(key);
  const raw = String(key||'');
  const n = normaliza(raw);
  const compact = compactKnowledgeText(raw);
  const tokens = knowledgeTokens(raw);
  let best = null;
  let bestScore = 0;
  for(const item of AJAX_KNOWLEDGE){
    const kn = normaliza(item.n);
    const kc = compactKnowledgeText(item.n);
    const kt = knowledgeTokens(item.n);
    let score = 0;
    if(kc && compact.includes(kc)) score += 900 + kc.length;
    if(kc && kc.includes(compact) && compact.length>4) score += 350;
    for(const t of kt){
      if(tokens.includes(t)) score += 160;
      else if(compact.includes(t)) score += 95;
      else if(tokens.some(pt => pt.startsWith(t) || t.startsWith(pt))) score += 45;
    }
    // Reglas para referencias del CSV abreviadas.
    if(kn.includes('home') && kn.includes('siren') && compact.includes('homesiren')) score += 700;
    if(kn.includes('street') && kn.includes('siren') && compact.includes('streetsiren')) score += 700;
    if(kn.includes('doorprotect plus') && compact.includes('doorprotectplus')) score += 800;
    if(kn.includes('doorprotect') && compact.includes('doorprotect')) score += 520;
    if(kn.includes('motionprotect plus') && compact.includes('motionprotectplus')) score += 800;
    if(kn.includes('motionprotect') && compact.includes('motionprotect')) score += 520;
    if(kn.includes('motioncam') && compact.includes('motioncam')) score += 720;
    if(kn.includes('glassprotect') && compact.includes('glassprotect')) score += 720;
    if(kn.includes('fireprotect 2') && compact.includes('fireprotect2')) score += 760;
    if(kn.includes('fireprotect plus') && compact.includes('fireprotectplus')) score += 740;
    if(kn.includes('fireprotect') && compact.includes('fireprotect')) score += 540;
    if(kn.includes('leaksprotect') && compact.includes('leaksprotect')) score += 900;
    if(kn.includes('waterstop') && compact.includes('waterstop')) score += 900;
    if(kn.includes('lifequality lite') && compact.includes('lifequalitylite')) score += 850;
    if(kn.includes('lifequality') && compact.includes('lifequality')) score += 650;
    if(kn.includes('hub 2 plus') && compact.includes('hub2plus')) score += 900;
    if(kn.includes('hub 2') && compact.includes('hub2')) score += 760;
    if(kn.includes('hub bp') && compact.includes('hubbp')) score += 850;
    if(kn === 'hub' && /^ajhub[\-\w]*$/.test(n.replace(/\s+/g,''))) score += 500;
    if(kn.includes('rex 2') && compact.includes('rex2')) score += 850;
    if(kn === 'rex jeweller' && compact.includes('rex')) score += 520;
    if(kn.includes('keypad touchscreen') && compact.includes('keypadtouchscreen')) score += 900;
    if(kn.includes('keypad outdoor') && compact.includes('keypadoutdoor')) score += 850;
    if(kn.includes('keypad plus') && compact.includes('keypadplus')) score += 820;
    if(kn.includes('keypad') && compact.includes('keypad')) score += 500;
    if(kn.includes('spacecontrol') && compact.includes('spacecontrol')) score += 850;
    if(kn.includes('doublebutton') && compact.includes('doublebutton')) score += 850;
    if(kn.includes('button') && compact.includes('button')) score += 480;
    if(kn.includes('relay') && compact.includes('relay')) score += 600;
    if(kn.includes('wallswitch') && compact.includes('wallswitch')) score += 850;
    if(kn.includes('socket') && compact.includes('socket')) score += 850;
    if(kn.includes('outlet') && compact.includes('outlet')) score += 850;
    if(kn.includes('lightswitch') && (compact.includes('lightcore') || compact.includes('lightswitch'))) score += 700;
    if(kn.includes('dimmer') && compact.includes('dimmer')) score += 400;
    if(kn.includes('nvr') && compact.includes('nvr')) score += 650;
    if(kn.includes('bulletcam') && compact.includes('bulletcam')) score += 850;
    if(kn.includes('domecam') && compact.includes('domecam')) score += 850;
    if(kn.includes('turretcam') && compact.includes('turretcam')) score += 850;
    if(kn.includes('indoorcam') && compact.includes('indoorcam')) score += 850;
    if(kn.includes('doorbell') && compact.includes('doorbell')) score += 850;
    if(kn.includes('junctionbox') && compact.includes('junctionbox')) score += 850;
    if(kn.includes('mountcam a1') && compact.includes('mountcama1')) score += 900;
    if(kn.includes('mountcam a2') && compact.includes('mountcama2')) score += 900;
    if(kn.includes('mountcam b1') && compact.includes('mountcamb1')) score += 900;
    if(kn.includes('mountcam b2') && compact.includes('mountcamb2')) score += 900;
    if(kn.includes('surfacebox') && compact.includes('surfacebox')) score += 850;
    if(kn.includes('psu') && (compact.includes('psu') || compact.includes('pcb'))) score += 500;
    if(kn.includes('12v psu for nvr') && compact.includes('psunvr')) score += 950;
    if(kn.includes('12v psu') && compact.includes('dc12')) score += 600;
    if(kn.includes('12-24v psu') && compact.includes('dc1224')) score += 650;
    if(score > bestScore){ best = item; bestScore = score; }
  }
  const result = bestScore >= 260 ? best : null;
  knowledgeCache.set(key, result);
  return result;
}
function iconoPorFamilia(info, p){
  const f = normaliza((info && info.f) || '');
  const n = normaliza(((info && info.n) || '') + ' ' + ((p && p.name) || ''));
  if(f.includes('camara') || f.includes('videovigilancia') || f.includes('timbres') || n.includes('cam') || n.includes('nvr')) return n.includes('nvr') ? '🎥' : '📷';
  if(f.includes('incendio') || n.includes('fire')) return '🔥';
  if(f.includes('inundacion') || f.includes('valvulas') || n.includes('water') || n.includes('leak')) return '💧';
  if(f.includes('hubs') || n.includes('hub')) return '🏠';
  if(f.includes('repetidores') || n.includes('rex')) return '📡';
  if(f.includes('sirenas') || n.includes('siren')) return '🔔';
  if(f.includes('teclados') || n.includes('keypad')) return '⌨️';
  if(f.includes('enchufes') || f.includes('reles') || f.includes('bases')) return '🔌';
  if(f.includes('interruptores') || n.includes('light') || n.includes('dimmer')) return '💡';
  if(f.includes('botones') || n.includes('button')) return '🟢';
  if(f.includes('apertura') || n.includes('door')) return '🚪';
  if(f.includes('movimiento') || n.includes('motion')) return '🚶';
  if(f.includes('cristal') || n.includes('glass')) return '🪟';
  if(f.includes('alimentacion') || n.includes('psu')) return '⚡';
  if(f.includes('carcasas') || f.includes('accesorios') || n.includes('mount') || n.includes('box')) return '🧩';
  if(f.includes('kits')) return '📦';
  return '📦';
}
function textoKnowledgeProducto(p){
  const info = conocimientoProducto(p);
  if(!info) return '';
  return [info.n, info.f, info.d, etiquetasFamiliaKnowledge(info, p).join(' ')].join(' ');
}
function etiquetasFamiliaKnowledge(info, p){
  const f = normaliza((info && info.f)||'');
  const n = normaliza(((info && info.n)||'') + ' ' + ((info && info.d)||'') + ' ' + ((p && p.name)||''));
  const out=[]; const add=(...xs)=>xs.forEach(x=>out.push(normaliza(x)));
  if(f.includes('kits')) add('kit','starter','pack alarma','alarma completa','kit basico','kit básico');
  if(f.includes('hubs')) add('hub','central','panel','central alarma','alarma','sim','ethernet','wifi','lte','4g','2g','fotoverificacion','fotoverificación');
  if(f.includes('repetidores')) add('rex','repetidor','ampliar cobertura','alcance','señal','senal','radio','wings','jeweller');
  if(f.includes('apertura')) add('puerta','ventana','apertura','contacto magnetico','contacto magnético','reed','impacto','inclinacion','inclinación');
  if(f.includes('cristal')) add('cristal','vidrio','rotura','escaparate','microfono','micrófono');
  if(f.includes('movimiento')) add('movimiento','pir','detector','presencia','volumetrico','volumétrico','perimetral','cortina','exterior','interior','fotoverificacion','fotoverificación');
  if(f.includes('sirenas')) add('sirena','alarma sonora','aviso','sonido','interior','exterior','antisabotaje');
  if(f.includes('botones')) add('boton','botón','mando','panico','pánico','emergencia','atraco','spacecontrol','llavero','control remoto');
  if(f.includes('teclados')) add('teclado','codigo','código','armar','desarmar','pantalla','tactil','táctil','pass','tag','smartphone');
  if(f.includes('camara') || f.includes('timbres') || f.includes('video')) add('camara','cámara','camaras','cámaras','video','videovigilancia','cctv','ip','poe','ia','wdr','microfono','micrófono','interior','exterior');
  if(f.includes('grabadores')) add('nvr','grabador','grabadores','videograbador','video','camaras','cámaras','canales','hdmi','4k','poe','disco duro','hdd','almacenamiento');
  if(f.includes('incendio')) add('incendio','fuego','humo','calor','temperatura','co','monoxido','monóxido','alarma incendio','en54','pulsador');
  if(f.includes('interruptores')) add('interruptor','luz','iluminacion','iluminación','mecanismo','pared','tactil','táctil','dimmer','cruce','conmutado','dos vias','2 vias');
  if(f.includes('bases')) add('enchufe','base enchufe','toma corriente','ethernet','lan','mecanismo','pared','surfacebox');
  if(f.includes('enchufes')) add('socket','enchufe inteligente','consumo','monitor consumo','domotica','domótica');
  if(f.includes('reles')) add('relay','rele','relé','contacto seco','automatizacion','automatización','control remoto','230v','garaje','motor','cerradura');
  if(f.includes('aire')) add('aire','calidad aire','co2','temperatura','humedad','ambiente','sensor ambiental');
  if(f.includes('inundacion')) add('agua','inundacion','inundación','fuga','fugas','humedad','detector agua','sensor agua');
  if(f.includes('valvulas')) add('waterstop','agua','valvula','válvula','corte agua','llave agua','fuga','inundacion','fontaneria');
  if(f.includes('integracion')) add('integracion','integración','modulo','módulo','cableado','terceros','entrada','salida','vhf');
  if(f.includes('fibra')) add('fibra','linea','línea','cableado','proteccion linea','alimentacion linea');
  if(f.includes('carcasas')) add('carcasa','caja','case','montaje','modulo','módulo','bateria','batería');
  if(f.includes('alimentacion')) add('fuente','alimentacion','alimentación','psu','12v','24v','6v','baja tension','baja tensión','nvr','hub','rex');
  if(n.includes('hlvf')) add('varifocal','2.8-12','motorizado','p iris','audio alarma');
  if(n.includes('hl')) add('iluminacion hibrida','iluminación híbrida','hybrid light');
  if(n.includes('8 mp') || n.includes('8mp')) add('8mp','8 mp','ocho megapixeles');
  if(n.includes('5 mp') || n.includes('5mp')) add('5mp','5 mp','cinco megapixeles');
  if(n.includes('4 mp') || n.includes('4mp')) add('4mp','4 mp','cuatro megapixeles');
  if(n.includes('2.8')) add('2.8mm','110 grados','gran angular');
  if(n.includes('4 mm') || n.includes('4mm')) add('4mm','85 grados');
  if(n.includes('16 canales') || n.includes('16-ch')) add('16 canales','dieciseis canales','dieciséis canales');
  if(n.includes('32 canales') || n.includes('32-ch')) add('32 canales','treinta y dos canales');
  if(n.includes('8 canales') || n.includes('8-ch')) add('8 canales','ocho canales');
  return [...new Set(out)].filter(Boolean);
}

function etiquetasProducto(p){
  const raw = normaliza(((p && p.name) || '') + ' ' + ((p && p.brand) || ''));
  const tags = [];
  const add = (...xs) => xs.forEach(x => tags.push(normaliza(x)));

  // Agua / inundación
  if(raw.includes('leak') || raw.includes('waterstop')) add('agua','inundacion','fuga','fugas','humedad','detector de agua','sensor agua','anti inundacion','anti fugas','corte agua','llave agua','valvula agua','válvula agua','cierre agua');
  if(raw.includes('waterstop')) add('valvula','válvula','electrovalvula','electroválvula','corte automatico','corte automático','cerrar agua','llave de paso');

  // Intrusión / detectores
  if(raw.includes('motion')) add('movimiento','movimientos','detector','detectores','presencia','pir','sensor movimiento','volumetrico','volumétrico','intrusion','intrusión','alarma interior');
  if(raw.includes('motioncam')) add('camara','cámara','foto','verificacion','verificación','detector con camara','detector con cámara','fotodetector');
  if(raw.includes('outdoor') || raw.includes('curtain') || raw.includes('dualcurtain') || raw.includes('outdoorprotect')) add('exterior','intemperie','perimetral','jardin','jardín','calle','terraza','barrera','barrera movimiento','proteccion exterior','protección exterior');
  if(raw.includes('curtain')) add('cortina','barrera cortina','barrera inalambrica','barrera inalámbrica','perimetro','perímetro');
  if(raw.includes('doorprotect') || raw.includes('door')) add('puerta','puertas','ventana','ventanas','contacto','magnetico','magnético','apertura','sensor puerta','sensor ventana','contacto magnetico','contacto magnético');
  if(raw.includes('glass')) add('cristal','vidrio','rotura','rotura cristal','rotura vidrio','escaparate','detector cristal');

  // Incendio y seguridad vital
  if(raw.includes('fire')) add('incendio','incendios','humo','humos','fuego','temperatura','calor','co','monoxido','monóxido','detector humo','detector incendio','seguridad vida','vida','alarma incendio');
  if(raw.includes('manualcallpoint')) add('pulsador incendio','pulsador emergencia','boton incendio','botón incendio','evacuacion','evacuación','manual call point');
  if(raw.includes('lifequality')) add('calidad aire','aire','co2','temperatura','humedad','ambiente','sensor ambiente','calidad ambiental');

  // Sirenas, control y mandos
  if(raw.includes('siren')) add('sirena','sirenas','alarma sonora','sonora','aviso','acustica','acústica','alerta','avisador');
  if(raw.includes('keypad')) add('teclado','teclados','codigo','codigos','código','control','armar','desarmar','pantalla','touchscreen','lector','control alarma');
  if(raw.includes('button') || raw.includes('doublebutton')) add('boton','botón','panico','pánico','pulsador','emergencia','atraco','alarma silenciosa');
  if(raw.includes('tag') || raw.includes('pass') || raw.includes('spacecontrol')) add('mando','mandos','llavero','llaveros','tarjeta','tag','acceso','control remoto','proximidad','desarmar');

  // Centrales, comunicación y repetidores
  if(raw.includes('hub')) add('central','alarma','panel','comunicador','wifi','4g','ethernet','hub','central alarma','cerebro alarma','panel alarma');
  if(raw.includes('rex')) add('repetidor','extensor','amplificador','cobertura','alcance','radio');
  if(raw.includes('ocbridge') || raw.includes('uartbridge') || raw.includes('vhfbridge') || raw.includes('transmitter') || raw.includes('multitransmitter')) add('integracion','integración','cableado','cableada','modulo cableado','módulo cableado','entrada cableada','transmisor');

  // Vídeo / cámaras / NVR
  if(raw.includes('nvr')) add('nvr','grabador','grabadores','videograbador','videograbadores','grabador camaras','grabador cámaras','grabador de camaras','grabador de cámaras','disco duro','hdd','hd','almacenamiento','cctv','videovigilancia','video vigilancia','camaras','cámaras','poe','switch poe','8 canales','16 canales','32 canales');
  if(raw.includes('bullet') || raw.includes('dome') || raw.includes('turret') || raw.includes('indoorcam') || raw.includes('doorbell') || raw.includes('cam')) add('camara','camaras','cámara','cámaras','video','vídeo','vigilancia','cctv','ip','vision nocturna','visión nocturna','exterior','interior','domo','bullet','torreta','turret','dome','onvif','rtsp');
  if(raw.includes('doorbell')) add('videoportero','timbre','portero','llamada puerta','puerta');
  if(raw.includes('storage')) add('almacenamiento','cloud','nube','grabacion','grabación','video','camaras','cámaras');

  // Automatización / confort / electricidad
  if(raw.includes('relay') || raw.includes('wallswitch')) add('rele','reles','relé','relés','automatizacion','automatización','domotica','domótica','contacto seco','salida rele','salida relé','control electrico','control eléctrico');
  if(raw.includes('socket') || raw.includes('outlet')) add('enchufe','toma corriente','corriente','smart plug','consumo','domotica','domótica');
  if(raw.includes('switch') || raw.includes('lightcore') || raw.includes('dimmer') || raw.includes('button') || raw.includes('centerbutton') || raw.includes('sidebutton') || raw.includes('solobutton')) add('interruptor','pulsador','luz','iluminacion','iluminación','dimmer','regulador','domotica','domótica','mecanismo');
  if(raw.includes('ledstrip')) add('led','tira led','iluminacion','iluminación','luz');

  // Alimentación / baterías / red / accesorios de futuro
  if(raw.includes('battery') || raw.includes('batt')) add('bateria','baterias','batería','baterías','alimentacion','alimentación','pila','backup','respaldo','sai');
  if(raw.includes('dc12') || raw.includes('dc1224') || raw.includes('ac220') || raw.includes('psu')) add('alimentador','alimentadores','fuente','fuentes','fuente alimentacion','fuente alimentación','transformador','12v','12 voltios','24v','220v','corriente','alimentacion');
  if(raw.includes('poe')) add('poe','switch poe','inyector poe','48v','48 voltios','alimentar camaras','alimentar cámaras','red poe');
  if(raw.includes('lan') || raw.includes('ethernet')) add('red','ethernet','lan','switch normal','switch red','conector red','cable red');
  if(raw.includes('storage') || raw.includes('hdd') || raw.includes('hd')) add('disco duro','hdd','hd','almacenamiento','memoria','grabacion','grabación');
  if(raw.includes('sd') || raw.includes('microsd')) add('micro sd','microsd','tarjeta memoria','tarjeta de memoria','memoria camara','memoria cámara');

  // Montajes, soportes y accesorios
  if(raw.includes('bracket') || raw.includes('holder') || raw.includes('frame') || raw.includes('cover') || raw.includes('magnet') || raw.includes('junctionbox') || raw.includes('mount') || raw.includes('hood') || raw.includes('surfacebox')) add('soporte','soportes','montaje','base','bracket','tapa','marco','caja','cajas','caja conexiones','imán','iman','recambio','accesorio','accesorios','protector','visera');
  if(raw.includes('kit')) add('kit','pack','conjunto','starter','arranque');
  if(raw.includes('dummy') || raw.includes('demo') || raw.includes('democase') || raw.includes('suitcase')) add('demo','muestra','dummy','expositor','maleta','demo case');

  // Material adicional que podrá entrar al CSV más adelante
  add('ajax','seguridad','alarma profesional');
  if(raw.includes('hdd') || raw.includes('nvr')) add('disco duro hd','disco duro nvr');
  if(raw.includes('switch')) add('switch normal','switch poe','switch de red');
  if(raw.includes('injector') || raw.includes('inyector')) add('inyector poe','48 voltios');
  if(raw.includes('solar')) add('solar','inalambrica solar','inalámbrica solar');

  // Colores y variantes útiles
  if(/-b(\b|-|$)/.test(raw)) add('negro','black');
  if(/-w(\b|-|$)/.test(raw)) add('blanco','white');
  if(raw.includes('gra')) add('grafito','gris');
  if(raw.includes('gre')) add('verde');
  if(raw.includes('rb')) add('bateria reemplazable','batería reemplazable');
  if(raw.includes('sb')) add('bateria sellada','batería sellada');
  if(raw.includes('hac')) add('disco incluido','hdd incluido','con disco duro');
  if(raw.includes('8p') || raw.includes('16p')) add('poe','puertos poe','switch poe integrado');


  // Plurales y sinónimos directos v18.4: búsqueda rápida
  if(raw.includes('relay')) add('reles','relés','relays');
  if(raw.includes('siren')) add('sirenas');
  if(raw.includes('nvr')) add('grabadores','videograbadores');
  if(raw.includes('bullet') || raw.includes('dome') || raw.includes('turret') || raw.includes('indoorcam') || raw.includes('doorbell')) add('camaras','cámaras');
  if(raw.includes('motion')) add('movimientos','detectores');
  if(raw.includes('doorprotect') || raw.includes('door')) add('puertas','ventanas');
  if(raw.includes('fire')) add('incendios','humos');
  if(raw.includes('leak') || raw.includes('waterstop')) add('fugas','inundaciones');
  if(raw.includes('keypad')) add('teclados');
  if(raw.includes('spacecontrol') || raw.includes('button') || raw.includes('tag') || raw.includes('pass')) add('mandos');
  if(raw.includes('battery') || raw.includes('batt')) add('baterias','baterías');
  if(raw.includes('psu') || raw.includes('dc12') || raw.includes('dc1224') || raw.includes('ac220')) add('alimentadores','fuentes');
  if(raw.includes('bracket') || raw.includes('holder') || raw.includes('junctionbox') || raw.includes('mount') || raw.includes('surfacebox')) add('soportes','cajas','accesorios');

  return [...new Set(tags)].filter(Boolean);
}
function textoBusquedaProducto(p){
  return normaliza([p.name, p.brand, descripcionProducto(p).desc, textoKnowledgeProducto(p), etiquetasProducto(p).join(' ')].join(' '));
}
function descripcionProductoBase(p){
  const n = normaliza((p && p.name) || '');

  // Agua / inundación
  if(n.includes('waterstop')) return {icon:'💧', desc:'Válvula de corte de agua AJAX'};
  if(n.includes('leaks')) return {icon:'💧', desc:'Detector de inundación y fugas de agua AJAX'};

  // Vídeo y grabación
  if(n.includes('nvr')){
    if(n.includes('poe') || n.includes('pac') || n.includes('8p') || n.includes('16p')) return {icon:'🎥', desc:'Grabador de vídeo en red con PoE para cámaras'};
    if(n.includes('dc') || n.includes('hdc')) return {icon:'🎥', desc:'Grabador de vídeo en red de baja tensión'};
    return {icon:'🎥', desc:'Grabador de vídeo en red para cámaras'};
  }
  if(n.includes('bullet')) return {icon:'📷', desc:'Cámara IP tipo bullet con IA, PoE/12V y WDR'};
  if(n.includes('dome')) return {icon:'📷', desc:'Cámara IP tipo domo con IA, PoE/12V y WDR'};
  if(n.includes('turret')) return {icon:'📷', desc:'Cámara IP tipo turret/torreta con IA y PoE/12V'};
  if(n.includes('indoorcam')) return {icon:'📷', desc:'Cámara Wi‑Fi interior con PIR e IA'};
  if(n.includes('doorbell')) return {icon:'📹', desc:'Vídeo timbre con IA, PIR y control desde app'};
  if(n.includes('cam') || n.includes('camera')) return {icon:'📷', desc:'Dispositivo de vídeo o cámara AJAX'};
  if(n.includes('hdd') || n.includes('storage')) return {icon:'💾', desc:'Almacenamiento para vídeo y grabadores'};

  // Hubs y kits
  if(n.includes('starter') || n.includes('kit')) return {icon:'📦', desc:'Kit básico AJAX con central y dispositivos de alarma'};
  if(n.includes('hubbp')) return {icon:'🏠', desc:'Panel de control inalámbrico alimentado por batería'};
  if(n.includes('hub2plus')) return {icon:'🏠', desc:'Panel de control con fotoverificación, Wi‑Fi, Ethernet y doble SIM'};
  if(n.includes('hub2')) return {icon:'🏠', desc:'Panel de control con fotoverificación, Ethernet y doble SIM'};
  if(n.includes('hub')) return {icon:'🏠', desc:'Panel de control inalámbrico para sistema AJAX'};
  if(n.includes('rex')) return {icon:'📡', desc:'Repetidor de señal de radio AJAX'};

  // Intrusión
  if(n.includes('doorprotectplus')) return {icon:'🚪', desc:'Detector de apertura, impacto e inclinación'};
  if(n.includes('doorprotect') || n.includes('door')) return {icon:'🚪', desc:'Detector de apertura para puerta o ventana'};
  if(n.includes('glass')) return {icon:'🪟', desc:'Detector de rotura de cristal con micrófono'};
  if(n.includes('combiprotect')) return {icon:'🚶', desc:'Detector de movimiento y rotura de cristal'};
  if(n.includes('motioncam')) return {icon:'📷', desc:'Detector de movimiento con verificación fotográfica'};
  if(n.includes('motionprotectplus')) return {icon:'🚶', desc:'Detector de movimiento con sensor microondas adicional'};
  if(n.includes('motion')) return {icon:'🚶', desc:'Detector inalámbrico de movimiento PIR'};
  if(n.includes('curtain')) return {icon:'🛡️', desc:'Detector de movimiento tipo cortina/perimetral'};

  // Incendio y vida
  if(n.includes('manualcallpoint')) return {icon:'🚨', desc:'Pulsador manual de alarma de incendio'};
  if(n.includes('fireprotect2')){
    if(n.includes('hsc')) return {icon:'🔥', desc:'Detector de incendio combinado: calor, humo y CO'};
    if(n.includes('hs')) return {icon:'🔥', desc:'Detector de incendio combinado: calor y humo'};
    if(n.includes('hc')) return {icon:'🔥', desc:'Detector de incendio combinado: calor y CO'};
    if(n.includes('-c-') || n.includes('(co')) return {icon:'🔥', desc:'Detector de monóxido de carbono CO'};
    if(n.includes('-h-')) return {icon:'🔥', desc:'Detector de calor para alarma de incendio'};
    return {icon:'🔥', desc:'Detector de incendio AJAX'};
  }
  if(n.includes('fire')) return {icon:'🔥', desc:'Detector de incendio, humo, calor o CO'};
  if(n.includes('lifequality')) return {icon:'🌿', desc:'Monitor de calidad del aire, temperatura y humedad'};

  // Control, sirenas e integración
  if(n.includes('siren')) return {icon:'🔔', desc:'Sirena inalámbrica para alarma AJAX'};
  if(n.includes('speakerphone')) return {icon:'☎️', desc:'Módulo de voz para verificación de alarmas'};
  if(n.includes('keypadtouchscreen')) return {icon:'⌨️', desc:'Teclado con pantalla táctil y autenticación avanzada'};
  if(n.includes('keypadoutdoor')) return {icon:'⌨️', desc:'Teclado inalámbrico para exterior e interior'};
  if(n.includes('keypad')) return {icon:'⌨️', desc:'Teclado inalámbrico de control AJAX'};
  if(n.includes('spacecontrol')) return {icon:'🔑', desc:'Mando inalámbrico con botón de pánico'};
  if(n.includes('doublebutton')) return {icon:'🟢', desc:'Botón de emergencia inalámbrico'};
  if(n.includes('button')) return {icon:'🟢', desc:'Botón de pánico o botón inteligente'};
  if(n.includes('tag') || n.includes('pass')) return {icon:'🔑', desc:'Dispositivo de acceso sin contacto'};
  if(n.includes('multitransmitter')) return {icon:'🔗', desc:'Módulo para integrar dispositivos cableados de terceros'};
  if(n.includes('transmitter')) return {icon:'🔗', desc:'Módulo para integrar un dispositivo de terceros'};
  if(n.includes('vhfbridge')) return {icon:'📡', desc:'Módulo para conectar AJAX a transmisores VHF'};

  // Automatización, alimentación y accesorios
  if(n.includes('wallswitch')) return {icon:'🔌', desc:'Relé de potencia para control remoto 110/230V'};
  if(n.includes('relay')) return {icon:'🔌', desc:'Relé inalámbrico de contacto seco'};
  if(n.includes('socket') || n.includes('outlet')) return {icon:'🔌', desc:'Enchufe o toma inteligente AJAX'};
  if(n.includes('lightcore') || n.includes('dimmer') || n.includes('centerbutton') || n.includes('sidebutton') || n.includes('solobutton')) return {icon:'💡', desc:'Mecanismo de iluminación o interruptor inteligente'};
  if(n.includes('psu') || n.includes('dc12') || n.includes('dc1224') || n.includes('ac220')) return {icon:'⚡', desc:'Fuente de alimentación o alimentador AJAX'};
  if(n.includes('battery') || n.includes('batt')) return {icon:'🔋', desc:'Batería o alimentación de respaldo'};
  if(n.includes('bracket') || n.includes('holder') || n.includes('frame') || n.includes('cover') || n.includes('mount') || n.includes('junctionbox') || n.includes('hood')) return {icon:'🧩', desc:'Accesorio de montaje, soporte o caja'};
  return {icon:'📦', desc:'Accesorio o dispositivo AJAX'};
}

function descripcionProducto(p){
  const info = conocimientoProducto(p);
  if(info && info.d){
    return {icon:iconoPorFamilia(info,p), desc:info.d, family:info.f, official:info.n};
  }
  return descripcionProductoBase(p);
}
function productoTitulo(p){
  const d = descripcionProducto(p);
  return `${d.icon} ${p.name}`;
}
function aplicarTemaGuardado(){
  const tema = localStorage.getItem(STORAGE_TEMA) || 'dark';
  document.body.classList.toggle('light-mode', tema === 'light');
  const btn = $('#themeToggle');
  if(btn) btn.textContent = tema === 'light' ? '🌙 Modo oscuro' : '☀️ Modo claro';
}
function alternarTema(){
  const esClaro = !document.body.classList.contains('light-mode');
  localStorage.setItem(STORAGE_TEMA, esClaro ? 'light' : 'dark');
  aplicarTemaGuardado();
}

function escapeHtml(s){ return String(s).replace(/[&<>"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
function scoreProducto(p, term){
  const t = normaliza(term);
  if(!t) return 0;
  const n = normaliza(p.name), b = normaliza(p.brand), indice = textoBusquedaProducto(p);
  const tokensNombre = n.split(/[^a-z0-9]+/).filter(Boolean);
  let score = 0;
  const parts = t.split(/\s+/).filter(Boolean);
  for(const part of parts){
    // Prioridad alta para coincidencias reales en nombre/referencia.
    // Ejemplo: al escribir "nvr" deben salir todos los AJ-NVR..., antes que cámaras relacionadas por etiquetas.
    if(tokensNombre.includes(part)) score += 520;
    else if(n === part) score += 500;
    else if(n.startsWith(part)) score += 260;
    else if(n.includes(part)) score += 180;
    if(b.includes(part)) score += 12;
    if(indice.includes(part)) score += 55;
  }
  if(n === t) score += 600;
  if(tokensNombre.includes(t)) score += 520;
  if(n.includes(t)) score += 220;
  if(indice.includes(t)) score += 80;
  return score;
}
function buscar(term){
  const forzada = busquedaForzada(term);
  if(forzada) return forzada;
  const t = normaliza(term);
  if(!t) return [];
  const base = productos
    .map((p,i)=>({p,i,score:scoreProducto(p,term), n:normaliza(p.name), b:normaliza(p.brand)}))
    .filter(x=>x.score>0);

  // PRO: si el texto aparece literalmente en referencia/nombre, esos productos van SIEMPRE primero.
  // Corrige casos como "nvr" o "motion", donde antes podían quedar mezclados con resultados semánticos.
  const exactos = base
    .filter(x=>x.n.includes(t) || x.b.includes(t))
    .sort((a,b)=>{
      const ap = a.n.startsWith(t) ? 0 : 1;
      const bp = b.n.startsWith(t) ? 0 : 1;
      return ap-bp || a.p.name.localeCompare(b.p.name,'es');
    });
  const resto = base
    .filter(x=>!(x.n.includes(t) || x.b.includes(t)))
    .sort((a,b)=>b.score-a.score || a.p.name.localeCompare(b.p.name,'es'));

  // Para búsquedas cortas de familias (nvr, hub, rex, poe, etc.) no recortamos demasiado.
  const limite = t.length <= 6 ? 160 : 90;
  return [...exactos, ...resto].slice(0, limite);
}
function pintarResultados(term){
  const panel = $('#resultados');
  const results = buscar(term);
  activeIndex = -1;
  if(!term.trim() || !results.length){
    panel.classList.add('hidden');
    panel.innerHTML='';
    panel.dataset.firstIndex='';
    return;
  }

  // Guardamos explícitamente el primer resultado de ESTA búsqueda actual.
  panel.dataset.firstIndex = String(results[0].i);

  panel.innerHTML = results.map((x,k)=>{
    const d = descripcionProducto(x.p);
    return `<div class="result-item" data-index="${x.i}" data-k="${k}"><div><div class="result-name">${escapeHtml(d.icon)} ${escapeHtml(x.p.name)}</div><div class="result-meta">${escapeHtml(d.desc)}</div></div><div class="result-price">${fmt.format(x.p.pvp)}</div></div>`;
  }).join('');

  panel.querySelectorAll('.result-item').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ activeIndex = Number(el.dataset.k); marcarActivo(); });
    el.addEventListener('click',()=> seleccionarProducto(Number(el.dataset.index), true));
    el.addEventListener('dblclick',()=>{ seleccionarProducto(Number(el.dataset.index), true); addLinea(); });
  });

  panel.classList.remove('hidden');
}
function seleccionarProducto(i, cerrar=false){
  seleccionado = productos[i] ? i : null;
  if(seleccionado===null) return;
  $('#producto').value = String(i);
  const btnCat=$('#btnCatalogo'); if(btnCat) btnCat.innerHTML = '<span class="btn-ico">📖</span>Catálogo';
  $('#buscador').value = productos[i].name;
  { const d = descripcionProducto(productos[i]); $('#previewProducto').innerHTML = `<b>${escapeHtml(d.icon)} ${escapeHtml(productos[i].name)}</b> · ${escapeHtml(d.desc)} · ${fmt.format(productos[i].pvp)}`; }
  if(cerrar) $('#resultados').classList.add('hidden');
}
function resolverDesdeInput(){
  const term = $('#buscador').value;
  seleccionado = null;
  $('#producto').value = '';
  pintarResultados(term);

  const best = buscar(term)[0];
  if(best){
    const d = descripcionProducto(best.p);
    $('#previewProducto').innerHTML = `<b>${escapeHtml(d.icon)} ${escapeHtml(best.p.name)}</b> · ${escapeHtml(d.desc)} · ${fmt.format(best.p.pvp)}`;
  }else{
    $('#previewProducto').textContent='Selecciona un producto para ver su precio.';
  }
}
function moverActivo(dir){
  const items = [...document.querySelectorAll('.result-item')]; if(!items.length) return;
  activeIndex = (activeIndex + dir + items.length) % items.length;
  items.forEach(x=>x.classList.remove('active'));
  items[activeIndex].classList.add('active'); items[activeIndex].scrollIntoView({block:'nearest'});
}

function registrarReciente(nombre){ /* desactivado para no arrastrar productos en búsquedas */ }

function renderRecientes(){ const wrap=$('#recentes'); if(wrap) wrap.innerHTML=''; }

function buscarCatalogo(term=''){
  const limpio = String(term||'').trim();
  if(!limpio){
    return productos.map((p,i)=>({p,i,score:1})).sort((a,b)=>a.p.name.localeCompare(b.p.name,'es'));
  }
  const forzada = busquedaForzada(limpio);
  if(forzada) return forzada;
  return productos
    .map((p,i)=>({p,i,score:scoreProducto(p,limpio)}))
    .filter(x=>x.score>0)
    .sort((a,b)=>b.score-a.score || a.p.name.localeCompare(b.p.name,'es'));
}
const HX_MODAL_QTY = { catalog:new Map(), explorer:new Map() };
const HX_MODAL_LINE = { catalog:new Map(), explorer:new Map() };
let HX_MODAL_LINE_SEQ = 0;
function hxModalQtyGet(scope, idx){
  const map = HX_MODAL_QTY[scope];
  return Math.max(1, Number(map?.get(Number(idx))) || 1);
}
function hxModalQtySet(scope, idx, value){
  const map = HX_MODAL_QTY[scope];
  const qty = Math.max(1, Math.min(999, Number(value)||1));
  map?.set(Number(idx), qty);
  return qty;
}
function hxResetModalQty(scope){ HX_MODAL_QTY[scope]?.clear(); }
function hxResetModalSession(scope){ HX_MODAL_LINE[scope]?.clear(); }
function hxAddProductoModal(scope, idx, qty){
  const p = productos[Number(idx)];
  const cantidad = Math.max(1, Number(qty)||1);
  if(!p){ hxToastGlobal('No se pudo añadir el producto.','error'); return false; }

  const map = HX_MODAL_LINE[scope];
  const key = Number(idx);
  const lineId = map?.get(key);
  const existing = lineId ? lineas.find(l=>l && l._hxModalLineId===lineId) : null;

  if(existing){
    const anterior = Math.max(1, Number(existing.qty)||1);
    existing.qty = anterior + cantidad;
    render();
    hxToastGlobal(`${p.name} · cantidad ${anterior} → ${existing.qty}`, 'ok');
    return true;
  }

  if(!addProductoObj(p, cantidad, null)) return false;
  const created = lineas[lineas.length-1];
  if(created){
    created._hxModalLineId = `hxm-${scope}-${++HX_MODAL_LINE_SEQ}`;
    map?.set(key, created._hxModalLineId);
  }
  render();
  hxToastGlobal(cantidad > 1 ? `${p.name} · ${cantidad} unidades añadidas` : `${p.name} añadido`, 'ok');
  return true;
}
function hxQtyControlHtml(scope, idx){
  const qty = hxModalQtyGet(scope, idx);
  return `<div class="hx-modal-qty" data-scope="${scope}" data-index="${idx}">
    <button type="button" class="hx-modal-qty-btn hx-modal-qty-minus" aria-label="Restar cantidad">−</button>
    <span class="hx-modal-qty-value" aria-label="Cantidad">${qty}</span>
    <button type="button" class="hx-modal-qty-btn hx-modal-qty-plus" aria-label="Sumar cantidad">+</button>
  </div>`;
}
function hxBindQtyControls(root, scope){
  root.querySelectorAll('.hx-modal-qty').forEach(ctrl=>{
    ctrl.addEventListener('dblclick',e=>e.stopPropagation());
    const idx=Number(ctrl.dataset.index);
    const value=ctrl.querySelector('.hx-modal-qty-value');
    ctrl.querySelector('.hx-modal-qty-minus')?.addEventListener('click',e=>{
      e.stopPropagation();
      value.textContent=String(hxModalQtySet(scope,idx,hxModalQtyGet(scope,idx)-1));
    });
    ctrl.querySelector('.hx-modal-qty-plus')?.addEventListener('click',e=>{
      e.stopPropagation();
      value.textContent=String(hxModalQtySet(scope,idx,hxModalQtyGet(scope,idx)+1));
    });
  });
}

function pintarCatalogPanel(term=catalogTerm){
  catalogTerm = term || '';
  const itemsWrap = $('#catalogItems');
  const countWrap = $('#catalogCount');
  if(!itemsWrap || !countWrap) return;
  const totalList = buscarCatalogo(catalogTerm);
  const lista = totalList;
  countWrap.textContent = `${totalList.length} producto${totalList.length===1?'':'s'}`;
  itemsWrap.innerHTML = lista.map(x=>{
    const d = descripcionProducto(x.p);
    return `<div class="catalog-row" data-index="${x.i}">
      <div class="catalog-main">
        <strong>${escapeHtml(d.icon)} ${escapeHtml(x.p.name)}</strong>
        <span>${escapeHtml(d.desc)}</span>
      </div>
      <b>${fmt.format(x.p.pvp)}</b>
      ${hxQtyControlHtml('catalog', x.i)}
      <button type="button" class="catalog-add" data-index="${x.i}">Añadir</button>
    </div>`;
  }).join('') || '<div class="catalog-empty">No hay productos con esa búsqueda.</div>';
  function addCatalogProductPersistent(idx, trigger){
    const qty = hxModalQtyGet('catalog', idx);
    hxAddProductoModal('catalog', Number(idx), qty);
    if(trigger){
      const original = trigger.textContent;
      trigger.textContent = '✓ Añadido';
      trigger.classList.add('added-ok');
      setTimeout(()=>{ trigger.textContent = original || 'Añadir'; trigger.classList.remove('added-ok'); }, 750);
    }
    const filter = $('#catalogFilter');
    if(filter){
      /* Conserva resultados y posición. Seleccionar el texto permite
         escribir la siguiente búsqueda encima sin reconstruir la lista. */
      setTimeout(()=>{ filter.focus(); filter.select(); }, 0);
    }
  }
  hxBindQtyControls(itemsWrap, 'catalog');
  itemsWrap.querySelectorAll('.catalog-row').forEach(el=>el.addEventListener('dblclick',()=>{ addCatalogProductPersistent(Number(el.dataset.index), null); }));
  itemsWrap.querySelectorAll('.catalog-add').forEach(btn=>btn.addEventListener('click',e=>{ e.stopPropagation(); addCatalogProductPersistent(Number(btn.dataset.index), btn); }));
  itemsWrap.querySelectorAll('.catalog-row').forEach(el=>el.addEventListener('click',()=>{ seleccionarProducto(Number(el.dataset.index), true); }));
}
function abrirCatalogo(){
  const modal = $('#catalogModal');
  const filter = $('#catalogFilter');
  if(!modal) return;
  catalogTerm = '';
  if(filter) filter.value = '';
  pintarCatalogPanel('');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  setTimeout(()=>filter?.focus(), 30);
}
function cerrarCatalogo(){
  hxResetModalQty('catalog');
  hxResetModalSession('catalog');
  const modal = $('#catalogModal');
  if(!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}
function hxToastGlobal(text, type='ok'){
  try{
    document.querySelector('.hx-global-toast')?.remove();
    const t=document.createElement('div');
    t.className=`hx-global-toast ${type==='error'?'is-error':'is-ok'}`;
    t.textContent=String(text||'');
    document.body.appendChild(t);
    requestAnimationFrame(()=>t.classList.add('show'));
    setTimeout(()=>{
      t.classList.remove('show');
      setTimeout(()=>t.remove(),180);
    },1400);
  }catch(_){ }
}
function addLinea(){
  const term = ($('#buscador').value || '').trim();
  let idx = null;

  if(term){
    const act = $('.result-item.active');
    if(act) idx = Number(act.dataset.index);
    else {
      const r = buscar(term);
      if(r.length) idx = r[0].i;
    }
  }else if($('#producto').value !== ''){
    idx = Number($('#producto').value);
  }else{
    idx = seleccionado;
  }

  if(idx===null || idx===undefined || Number.isNaN(idx) || !productos[idx]){
    hxToastGlobal('Selecciona un producto.','error');
    return;
  }

  const p = productos[idx];
  const qty = Math.max(1, Number($('#cantidad').value)||1);
  addProductoObj(p, qty, null);
  hxToastGlobal(`${p.name} añadido`,'ok');

  $('#buscador').value='';
  $('#producto').value='';
  $('#cantidad').value=1;
  seleccionado=null;
  activeIndex=-1;
  $('#previewProducto').textContent='Selecciona un producto para ver su precio.';
  const btnCat=$('#btnCatalogo'); if(btnCat) btnCat.innerHTML='<span class="btn-ico">📖</span>Catálogo';
  const panel=$('#resultados'); if(panel){panel.classList.add('hidden'); panel.innerHTML='';}
  /* No reconstruir el catálogo completo después de cada alta.
     Era la principal causa de lentitud al elegir el siguiente producto. */
  render();
}
function addLineaManual(){
  lineas.push({name:'', brand:'', desc:'', pvp:0, qty:1, dto:descuentoActual(), manual:true});
  render();
  hxBajarUltimaLineaPresupuesto();
}
function addSeparador(){
  const texto = prompt('Texto del separador de sección:', 'SISTEMA DE ALARMA');
  if(texto === null) return;
  const name = String(texto || '').trim();
  if(!name) return;
  lineas.push({name:name.toUpperCase(), brand:'', desc:'', pvp:0, qty:1, dto:0, manual:true, separador:true});
  render();
  hxBajarUltimaLineaPresupuesto();
}
function setLinea(i,k,v){
  if(!lineas[i]) return;
  if(k==='name') lineas[i].name = lineas[i].separador ? String(v || '').toUpperCase() : String(v || '');
  if(k==='brand') lineas[i].brand = String(v || '');
  if(k==='desc') lineas[i].desc = String(v || '');
  if(k==='pvp') lineas[i].pvp = Math.max(0, Number(String(v).replace(',','.'))||0);
  if(k==='qty') lineas[i].qty = Math.max(1, Number(v)||1);
  if(k==='dto') lineas[i].dto = Math.max(0, Math.min(100, Number(v)||0));
  render();
}
function cambiarQtyLinea(i, delta){
  if(!lineas[i] || lineas[i].separador) return;
  const actual = Math.max(1, Number(lineas[i].qty) || 1);
  lineas[i].qty = Math.max(1, actual + Number(delta || 0));
  render();
  try{
    const row = document.querySelector(`#tbody tr[data-linea-index="${i}"]`);
    if(row){
      row.classList.remove('row-flash-add');
      void row.offsetWidth;
      row.classList.add('row-flash-add');
      setTimeout(()=>row.classList.remove('row-flash-add'), 700);
    }
  }catch(e){}
}
function delLinea(i){ lineas.splice(i,1); render(); }
try{ window.cambiarQtyLinea = cambiarQtyLinea; }catch(e){}
function calc(){
  const subtotalBruto = lineas.reduce((s,l)=> l.separador ? s : s + (Number(l.pvp)||0)*(Number(l.qty)||0),0);
  const base = lineas.reduce((s,l)=> l.separador ? s : s + ((Number(l.pvp)||0)*(Number(l.qty)||0)*(1-(Number(l.dto)||0)/100)),0);
  const dtoLineas = subtotalBruto - base;
  const ivaPct = Math.max(0, Number($('#iva').value)||0);
  const iva = base*ivaPct/100;
  return {subtotalBruto,dtoLineas,base,ivaPct,iva,total:base+iva};
}
function moverLinea(i, dir){
  const j = i + dir;
  if(j < 0 || j >= lineas.length) return;
  const tmp = lineas[i];
  lineas[i] = lineas[j];
  lineas[j] = tmp;
  render();
}

function activarArrastreLineas(){
  const tbody = document.querySelector('#tbody');
  if(!tbody || tbody.dataset.dragActivo === '1') return;
  tbody.dataset.dragActivo = '1';

  let filaOrigen = null;
  let clon = null;
  let hueco = null;
  let pointerId = null;
  let offsetY = 0;
  let ordenInicial = [];

  const filasReales = () => Array.from(tbody.querySelectorAll('tr[data-linea-index]'));

  function limpiar(){
    try{ clon?.remove(); }catch(_){ }
    try{ hueco?.replaceWith(filaOrigen); }catch(_){ }
    if(filaOrigen){
      filaOrigen.style.display='';
      filaOrigen.classList.remove('row-dragging284');
    }
    tbody.querySelectorAll('.row-drag-target284').forEach(x=>x.classList.remove('row-drag-target284'));
    document.body.classList.remove('hx-arrastrando-linea');
    filaOrigen = clon = hueco = null;
    pointerId = null;
    ordenInicial = [];
  }

  function crearClon(row, clientY){
    const rect = row.getBoundingClientRect();
    const srcCells = Array.from(row.children);

    const ghostTable = document.createElement('table');
    ghostTable.className = 'hx-drag-ghost';
    ghostTable.style.position = 'fixed';
    ghostTable.style.left = rect.left + 'px';
    ghostTable.style.top = rect.top + 'px';
    ghostTable.style.width = rect.width + 'px';
    ghostTable.style.height = rect.height + 'px';
    ghostTable.style.zIndex = '100000';
    ghostTable.style.pointerEvents = 'none';
    ghostTable.style.margin = '0';
    ghostTable.style.tableLayout = 'fixed';
    ghostTable.style.borderCollapse = 'collapse';
    ghostTable.style.borderSpacing = '0';

    const colgroup = document.createElement('colgroup');
    srcCells.forEach(cell => {
      const col = document.createElement('col');
      col.style.width = cell.getBoundingClientRect().width + 'px';
      colgroup.appendChild(col);
    });
    ghostTable.appendChild(colgroup);

    const ghostBody = document.createElement('tbody');
    const ghostRow = row.cloneNode(true);

    // Las filas separadoras usan colspan=6 en la tabla real. En la tabla
    // flotante solo hay dos celdas visibles (título + acciones); mantener ese
    // colspan ensancha la fila y oculta los botones.
    if(row.classList.contains('section-row')){
      const firstGhostCell = ghostRow.children[0];
      if(firstGhostCell){
        firstGhostCell.removeAttribute('colspan');
        firstGhostCell.colSpan = 1;
      }
    }

    // Copia 1:1 del estilo calculado de cada elemento. No añadimos wrappers
    // ni reinterpretamos botones: mover, X, + y - conservan su geometría real.
    function copiarEstiloCalculado(src, dst){
      const cs = getComputedStyle(src);
      for(let i=0; i<cs.length; i++){
        const prop = cs[i];
        dst.style.setProperty(prop, cs.getPropertyValue(prop), 'important');
      }
      dst.style.setProperty('transition','none','important');
      dst.style.setProperty('animation','none','important');
      dst.style.setProperty('pointer-events','none','important');
      const srcChildren = Array.from(src.children);
      const dstChildren = Array.from(dst.children);
      srcChildren.forEach((child, i)=>{
        if(dstChildren[i]) copiarEstiloCalculado(child, dstChildren[i]);
      });
    }
    copiarEstiloCalculado(row, ghostRow);

    ghostRow.style.setProperty('display','table-row','important');
    ghostRow.style.setProperty('height',rect.height+'px','important');
    ghostRow.style.setProperty('width',rect.width+'px','important');

    Array.from(ghostRow.children).forEach((cell, i) => {
      const src = srcCells[i];
      if(!src) return;
      const width = src.getBoundingClientRect().width;
      cell.style.setProperty('display','table-cell','important');
      cell.style.setProperty('width',width+'px','important');
      cell.style.setProperty('min-width',width+'px','important');
      cell.style.setProperty('max-width',width+'px','important');
      cell.style.setProperty('box-sizing','border-box','important');
    });

    // cloneNode no refleja el valor actual escrito en inputs/selects.
    const srcFields = row.querySelectorAll('input,select,textarea');
    const dstFields = ghostRow.querySelectorAll('input,select,textarea');
    dstFields.forEach((field, i) => {
      const src = srcFields[i];
      if(!src) return;
      if('value' in field) field.value = src.value;
      field.setAttribute('tabindex', '-1');
      const fieldRect = src.getBoundingClientRect();
      field.style.setProperty('width',fieldRect.width+'px','important');
      field.style.setProperty('min-width',fieldRect.width+'px','important');
      field.style.setProperty('max-width',fieldRect.width+'px','important');
      field.style.setProperty('height',fieldRect.height+'px','important');
      field.style.setProperty('box-sizing','border-box','important');
    });

    ghostBody.appendChild(ghostRow);
    ghostTable.appendChild(ghostBody);
    document.body.appendChild(ghostTable);
    offsetY = clientY - rect.top;
    return ghostTable;
  }

  function crearHueco(row){
    const ph = document.createElement('tr');
    ph.className='hx-drag-placeholder';
    const td=document.createElement('td');
    td.colSpan=7;
    td.style.height=row.getBoundingClientRect().height+'px';
    ph.appendChild(td);
    row.parentNode.insertBefore(ph,row);
    row.style.display='none';
    return ph;
  }

  function moverHueco(clientY){
    const rows = filasReales().filter(r=>r!==filaOrigen && r.style.display!=='none');
    let colocado=false;
    for(const row of rows){
      const rect=row.getBoundingClientRect();
      if(clientY < rect.top + rect.height/2){
        if(hueco.nextSibling!==row) tbody.insertBefore(hueco,row);
        colocado=true;
        break;
      }
    }
    if(!colocado) tbody.appendChild(hueco);
  }

  function autoscroll(clientY){
    const box=document.querySelector('.budget-card .table-scroll') || document.querySelector('.table-scroll');
    if(!box) return;
    const r=box.getBoundingClientRect();
    const margen=55;
    if(clientY < r.top + margen) box.scrollTop -= 14;
    else if(clientY > r.bottom - margen) box.scrollTop += 14;
  }

  function finalizar(){
    if(!filaOrigen || !hueco) return limpiar();
    const oldIndex=Number(filaOrigen.dataset.lineaIndex);
    const pos=Array.from(tbody.children).indexOf(hueco);
    const copia=lineas.slice();
    const [movida]=copia.splice(oldIndex,1);
    let newIndex=pos;
    if(pos>oldIndex) newIndex=pos-1;
    newIndex=Math.max(0,Math.min(copia.length,newIndex));
    copia.splice(newIndex,0,movida);
    const cambio=newIndex!==oldIndex;
    lineas=copia;
    limpiar();
    render();
    if(cambio){
      requestAnimationFrame(()=>{
        const fila=document.querySelector(`#tbody tr[data-linea-index="${newIndex}"]`);
        if(!fila) return;
        fila.classList.add('row-drop-saved284');
        setTimeout(()=>fila.classList.remove('row-drop-saved284'),420);
      });
    }
  }

  tbody.addEventListener('pointerdown', e=>{
    const handle=e.target.closest('.drag-btn');
    if(!handle) return;
    const row=handle.closest('tr[data-linea-index]');
    if(!row) return;
    e.preventDefault();
    pointerId=e.pointerId;
    filaOrigen=row;
    ordenInicial=filasReales().map(r=>Number(r.dataset.lineaIndex));
    // Crear primero la copia flotante mientras la fila aún conserva sus medidas.
    clon=crearClon(row,e.clientY);
    hueco=crearHueco(row);
    row.classList.add('row-dragging284');
    document.body.classList.add('hx-arrastrando-linea');
    try{ handle.setPointerCapture(pointerId); }catch(_){ }
  });

  tbody.addEventListener('pointermove', e=>{
    if(!filaOrigen || e.pointerId!==pointerId) return;
    e.preventDefault();
    if(clon) clon.style.top=(e.clientY-offsetY)+'px';
    moverHueco(e.clientY);
    autoscroll(e.clientY);
  });

  tbody.addEventListener('pointerup', e=>{
    if(!filaOrigen || e.pointerId!==pointerId) return;
    e.preventDefault();
    finalizar();
  });
  tbody.addEventListener('pointercancel', e=>{
    if(!filaOrigen || e.pointerId!==pointerId) return;
    limpiar();
  });
}

function render(){
  const body=$('#tbody');
  if(!lineas.length){ body.innerHTML='<tr><td colspan="7" class="empty">Añade productos para crear el presupuesto.</td></tr>'; }
  else body.innerHTML=lineas.map((l,i)=>{
    if(l.separador){
      const titulo = escapeHtml(String(l.name || 'SECCIÓN').toUpperCase());
      return `<tr class="section-row" data-linea-index="${i}"><td colspan="6"><input class="manual-input section-input" value="${titulo}" placeholder="Título de sección" onchange="setLinea(${i},'name',this.value)"></td><td class="num row-actions"><button type="button" class="drag-btn" draggable="true" title="Mantén y arrastra para mover" aria-label="Mover línea"><span></span><span></span><span></span></button><button class="trash" onclick="delLinea(${i})">×</button></td></tr>`;
    }
    const bruto=(Number(l.pvp)||0)*(Number(l.qty)||0), total=bruto*(1-(Number(l.dto)||0)/100);
    const producto = l.manual
      ? `<input class="manual-input" value="${escapeHtml(l.name||'')}" placeholder="Producto / concepto" onchange="setLinea(${i},'name',this.value)">`
      : escapeHtml(l.name);
    const descAuto = descripcionProducto({name:l.name, brand:l.brand||'AJAX'}).desc;
    const descripcion = l.manual
      ? `<input class="manual-input desc-input" value="${escapeHtml(l.desc||'')}" placeholder="Descripción" onchange="setLinea(${i},'desc',this.value)">`
      : `<span class="desc-cell">${escapeHtml(l.desc || descAuto)}</span>`;
    const pvp = `<input class="price-input editable-pvp" type="number" min="0" step="0.01" value="${Number(l.pvp)||0}" title="Editar PVP solo para este presupuesto. No modifica el CSV." onchange="setLinea(${i},'pvp',this.value)">`;
    return `<tr data-linea-index="${i}"><td class="product-cell">${producto}</td><td>${descripcion}</td><td class="num">${pvp}</td><td class="num qty-cell"><div class="line-qty-stepper"><button type="button" class="line-qty-btn" onclick="cambiarQtyLinea(${i},-1)" title="Bajar cantidad">−</button><input class="qty-input line-qty-input" type="number" min="1" value="${l.qty}" onchange="setLinea(${i},'qty',this.value)"><button type="button" class="line-qty-btn" onclick="cambiarQtyLinea(${i},1)" title="Subir cantidad">+</button></div></td><td class="num"><input class="dto-input" type="number" min="0" max="100" step="0.01" value="${l.dto||0}" onchange="setLinea(${i},'dto',this.value)"></td><td class="num"><b>${fmt.format(total)}</b></td><td class="num row-actions"><button type="button" class="drag-btn" draggable="true" title="Mantén y arrastra para mover" aria-label="Mover línea"><span></span><span></span><span></span></button><button class="trash" onclick="delLinea(${i})">×</button></td></tr>`;
  }).join('');
  const c=calc();
  $('#subtotalBruto').textContent=fmt.format(c.subtotalBruto);
  $('#baseDto').textContent=fmt.format(c.base);
  $('#ivaTxt').textContent=`IVA ${c.ivaPct}%`;
  $('#ivaVal').textContent=fmt.format(c.iva);
  $('#total').textContent=fmt.format(c.total);
  activarArrastreLineas();
}
function datosPresupuesto(){
  return {
    id: Date.now().toString(),
    guardado: new Date().toISOString(),
    tienda: $('#tienda') ? $('#tienda').value : '',
    cliente: $('#cliente').value,
    telefono: $('#telefono').value,
    email: $('#email').value,
    numero: $('#numero').value,
    fecha: $('#fecha').value,
    estado: $('#estado').value,
    validez: $('#validez').value,
    observaciones: $('#observaciones').value,
    dtoGeneral: $('#dtoGeneral').value,
    iva: $('#iva').value,
    lineas
  };
}
function aplicarPresupuesto(d){
  ['tienda','cliente','telefono','email','numero','fecha','estado','validez','observaciones','dtoGeneral','iva'].forEach(k=>{ if(d[k]!==undefined && $('#'+k)) $('#'+k).value=d[k]; });
  lineas = Array.isArray(d.lineas) ? d.lineas : [];
  render();
}
function storageHashPresupuestos(lista){
  const text = JSON.stringify(Array.isArray(lista) ? lista : []);
  let hash = 2166136261;
  for(let i=0;i<text.length;i++){
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8,'0');
}
function parseListaPresupuestos(raw){
  try{
    const data = JSON.parse(raw || '[]');
    if(Array.isArray(data)) return data.filter(Boolean);
    if(data && Array.isArray(data.lista)){
      const lista = data.lista.filter(Boolean);
      if(!data.hash || data.hash === storageHashPresupuestos(lista)) return lista;
    }
    return [];
  }catch(e){ return []; }
}
function parseSnapshotPresupuestos(raw, origen){
  try{
    const data = JSON.parse(raw || 'null');
    if(Array.isArray(data)) return {lista:data.filter(Boolean), revision:0, fecha:'', origen, valida:true};
    if(!data || !Array.isArray(data.lista)) return null;
    const lista = data.lista.filter(Boolean);
    const valida = !data.hash || data.hash === storageHashPresupuestos(lista);
    return valida ? {lista, revision:Number(data.revision)||0, fecha:String(data.fecha||''), origen, valida:true} : null;
  }catch(e){ return null; }
}
function leerMetaPresupuestos(){
  try{
    const meta = JSON.parse(localStorage.getItem(STORAGE_LISTA_META) || '{}');
    return meta && typeof meta === 'object' ? meta : {};
  }catch(e){ return {}; }
}
function leerListaPresupuestos(){
  const meta = leerMetaPresupuestos();
  const candidatos = [];
  const principal = parseSnapshotPresupuestos(localStorage.getItem(STORAGE_LISTA), 'principal');
  if(principal){
    const hash = storageHashPresupuestos(principal.lista);
    if(!meta.hash || meta.hash === hash){
      principal.revision = Number(meta.revision)||principal.revision||0;
      principal.fecha = String(meta.fecha||principal.fecha||'');
      candidatos.push(principal);
    }
  }
  [
    [STORAGE_LISTA_SLOT_A,'snapshot-a'],
    [STORAGE_LISTA_SLOT_B,'snapshot-b'],
    [STORAGE_LISTA_BACKUP,'backup']
  ].forEach(([key,origen])=>{
    const snap = parseSnapshotPresupuestos(localStorage.getItem(key), origen);
    if(snap) candidatos.push(snap);
  });

  // Siempre gana la escritura válida más reciente. Nunca la que tenga más elementos,
  // porque eso podría resucitar presupuestos borrados o ignorar una lista nueva.
  candidatos.sort((a,b)=>(b.revision-a.revision) || String(b.fecha).localeCompare(String(a.fecha)));
  let elegida = candidatos[0] || null;

  // Migración de versiones antiguas solo cuando no existe ningún snapshot v2 válido.
  if(!elegida){
    for(const key of STORAGE_LISTA_LEGACY){
      const lista = parseListaPresupuestos(localStorage.getItem(key));
      if(lista.length){ elegida={lista,revision:1,fecha:new Date().toISOString(),origen:'legacy'}; break; }
    }
  }
  if(!elegida) return [];

  const hash = storageHashPresupuestos(elegida.lista);
  if(elegida.origen !== 'principal' || meta.hash !== hash){
    try{
      localStorage.setItem(STORAGE_LISTA, JSON.stringify(elegida.lista));
      localStorage.setItem(STORAGE_LISTA_META, JSON.stringify({
        version:2, revision:elegida.revision||1, fecha:elegida.fecha||new Date().toISOString(),
        cantidad:elegida.lista.length, hash, recuperadoDe:elegida.origen
      }));
    }catch(e){}
  }
  return elegida.lista;
}
function escribirListaPresupuestos(lista){
  const segura = Array.isArray(lista) ? lista.filter(Boolean).slice(0,100) : [];
  try{
    const metaAnterior = leerMetaPresupuestos();
    const revision = Math.max(0, Number(metaAnterior.revision)||0) + 1;
    const fecha = new Date().toISOString();
    const hash = storageHashPresupuestos(segura);
    const snapshot = {version:2, revision, fecha, cantidad:segura.length, hash, lista:segura};
    const slot = revision % 2 ? STORAGE_LISTA_SLOT_A : STORAGE_LISTA_SLOT_B;

    // Escritura transaccional sencilla: snapshot verificable -> principal -> metadatos.
    localStorage.setItem(slot, JSON.stringify(snapshot));
    localStorage.setItem(STORAGE_LISTA, JSON.stringify(segura));
    localStorage.setItem(STORAGE_LISTA_META, JSON.stringify({version:2,revision,fecha,cantidad:segura.length,hash}));
    localStorage.setItem(STORAGE_LISTA_BACKUP, JSON.stringify(snapshot));

    // Verificación inmediata para detectar cuota, bloqueo o escritura incompleta.
    const comprobacion = parseSnapshotPresupuestos(localStorage.getItem(slot), 'verificacion');
    if(!comprobacion || comprobacion.revision !== revision || storageHashPresupuestos(comprobacion.lista) !== hash){
      throw new Error('La verificación del almacenamiento no coincide');
    }
    return true;
  }catch(e){
    console.error('[Hiper Ajax] Error de almacenamiento:', e);
    alert('No se pudo guardar de forma segura en Chrome. Exporta una copia desde Presupuestos antes de cerrar.');
    return false;
  }
}
function exportarPresupuestos(){
  const lista = leerListaPresupuestos();
  const payload = {
    tipo:'hiperajax-presupuestos', version:1,
    exportado:new Date().toISOString(), presupuestos:lista
  };
  const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`hiperajax-presupuestos-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function exportarPresupuestoIndividual(p){
  if(!p) return;
  const payload={tipo:'hiperajax-presupuesto',version:1,exportado:new Date().toISOString(),presupuesto:p};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  const base=String(p.identificador||p.cliente||p.numero||'presupuesto').replace(/[^a-z0-9_-]+/gi,'_');
  a.download=`hiperajax-${base}.json`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

function importarPresupuestosArchivo(file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const raw=JSON.parse(String(reader.result||'{}'));
      const incoming=Array.isArray(raw) ? raw : (Array.isArray(raw.presupuestos) ? raw.presupuestos : (raw.presupuesto ? [raw.presupuesto] : null));
      if(!Array.isArray(incoming)) throw new Error('Formato no válido');
      const actuales=leerListaPresupuestos();
      const map=new Map();
      [...actuales,...incoming].forEach(p=>{
        if(!p||typeof p!=='object') return;
        const key=String(p.id || p.numero || `${p.cliente||''}-${p.fecha||''}-${Math.random()}`);
        const prev=map.get(key);
        if(!prev || String(p.guardado||p.fecha||'') >= String(prev.guardado||prev.fecha||'')) map.set(key,p);
      });
      escribirListaPresupuestos([...map.values()].sort((a,b)=>String(b.guardado||b.fecha||'').localeCompare(String(a.guardado||a.fecha||''))));
      refrescarPresupuestosGuardados();
      window.dispatchEvent(new CustomEvent('hiperajax:presupuestos-importados'));
      alert(`${incoming.length} presupuestos importados o revisados.`);
    }catch(e){ alert('No se pudo importar la copia. Selecciona un JSON exportado por Hiper Ajax.'); }
  };
  reader.readAsText(file);
}
function refrescarPresupuestosGuardados(){
  const sel = $('#presupuestosGuardados');
  if(!sel) return;
  const lista = leerListaPresupuestos().sort((a,b)=>String(b.guardado||'').localeCompare(String(a.guardado||'')));
  sel.innerHTML = '<option value="">Presupuestos guardados</option>' + lista.map(p=>{
    const nombre = [p.numero || 'Sin número', p.cliente || 'Sin cliente', p.fecha || ''].filter(Boolean).join(' · ');
    return `<option value="${escapeHtml(p.id)}">${escapeHtml(nombre)}</option>`;
  }).join('');
}
function guardar(){
  asegurarNumero();
  const data = datosPresupuesto();
  let lista = leerListaPresupuestos();
  const clave = (data.numero || '').trim();
  const idx = clave ? lista.findIndex(p => (p.numero || '').trim() === clave) : -1;
  if(idx >= 0){ data.id = lista[idx].id; lista[idx] = data; }
  else lista.unshift(data);
  escribirListaPresupuestos(lista.slice(0,100));
  refrescarPresupuestosGuardados();
  $('#presupuestosGuardados').value = data.id;
  alert('Presupuesto guardado. Podrás recuperarlo desde “Presupuestos guardados”.');
}
function cargarPresupuestoGuardado(){
  const id = $('#presupuestosGuardados').value;
  if(!id){ alert('Selecciona un presupuesto guardado.'); return; }
  const p = leerListaPresupuestos().find(x => String(x.id) === String(id));
  if(!p){ alert('No se encontró el presupuesto guardado.'); return; }
  aplicarPresupuesto(p);
}
function borrarPresupuestoGuardado(){
  const id = $('#presupuestosGuardados').value;
  if(!id){ alert('Selecciona un presupuesto guardado.'); return; }
  if(!confirm('¿Borrar este presupuesto guardado?')) return;
  escribirListaPresupuestos(leerListaPresupuestos().filter(x => String(x.id) !== String(id)));
  refrescarPresupuestosGuardados();
}
function nuevoPresupuesto(){
  if($('#tienda')) $('#tienda').value = '';
  ['cliente','telefono','email'].forEach(id=>{ const el=$('#'+id); if(el) el.value=''; });
  $('#numero').value = siguienteNumero(true);
  $('#fecha').value = new Date().toISOString().slice(0,10);
  $('#estado').value = 'Borrador';
  $('#validez').value = '30';
  $('#observaciones').value = '';
  $('#dtoGeneral').value = '0';
  $('#iva').value = '21';
  $('#buscador').value = '';
  $('#producto').value = '';
  $('#cantidad').value = '1';
  $('#resultados').classList.add('hidden');
  seleccionado = null;
  lineas = [];
  render();
  refrescarPresupuestosGuardados();
}
function cargarLocal(){
  // La página siempre arranca con un presupuesto en blanco.
  // Los presupuestos guardados solo se cargan al pulsar “Recuperar”.
  nuevoPresupuesto();
}

function duplicarPresupuesto(){
  const actual = datosPresupuesto();
  actual.id = Date.now().toString();
  actual.numero = siguienteNumero(false);
  actual.estado = 'Borrador';
  actual.fecha = new Date().toISOString().slice(0,10);
  actual.guardado = new Date().toISOString();
  aplicarPresupuesto(actual);
  guardar();
}

function limpiar(){
  if(confirm('¿Vaciar presupuesto?')){
    const contador = $('#previewProducto').textContent;
    nuevoPresupuesto();
    if(contador.includes('productos cargados')) $('#previewProducto').textContent = contador;
  }
}
async function imagenComoDataURL(url){
  try{
    const res = await fetch(url, {cache:'no-store'});
    if(!res.ok) throw new Error('No image');
    const blob = await res.blob();
    return await new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }catch(e){ return null; }
}
function formatFechaES(valor){
  if(!valor) return '-';
  const partes = String(valor).split('-');
  if(partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
  return valor;
}

function exportarExcel(){
  const tieneProductos=Array.isArray(lineas)&&lineas.some(l=>l&&!l.separador&&l.tipo!=='separador');
  if(!tieneProductos) return;
  if(!window.XLSX){ alert('No se pudo cargar el generador Excel. Comprueba la conexión a internet.'); return; }
  const wb=XLSX.utils.book_new();
  const aoa=[];
  aoa.push(['PRESUPUESTO AJAX']);
  aoa.push([]);
  aoa.push(['Tienda',$('#tienda')?.value||'']);
  aoa.push(['Cliente',$('#cliente')?.value||'']);
  aoa.push(['Teléfono',$('#telefono')?.value||'']);
  aoa.push(['Email',$('#email')?.value||'']);
  aoa.push(['Nº presupuesto',$('#numero')?.value||'']);
  aoa.push(['Fecha',$('#fecha')?.value||'']);
  aoa.push(['Estado',$('#estado')?.value||'']);
  aoa.push(['Validez (días)',Number($('#validez')?.value||0)]);
  aoa.push([]);
  aoa.push(['Producto','Descripción','PVP','Cantidad','Descuento %','Total']);
  const firstDataRow=aoa.length+1;
  lineas.forEach(l=>{
    if(l.separador) aoa.push([String(l.name||'SECCIÓN').toUpperCase(),'','','','','']);
    else aoa.push([l.name||'',l.desc||'',Number(l.pvp)||0,Number(l.qty)||1,Number(l.dto)||0,null]);
  });
  const lastDataRow=aoa.length;
  aoa.push([]);
  const subtotalRow=aoa.length+1; aoa.push(['','','','','Subtotal bruto',null]);
  const discountRow=aoa.length+1; aoa.push(['','','','','Descuento aplicado',null]);
  const baseRow=aoa.length+1; aoa.push(['','','','','Base imponible',null]);
  const ivaPct=Number($('#iva')?.value||0);
  const ivaRow=aoa.length+1; aoa.push(['','','','',`IVA ${ivaPct}%`,null]);
  const totalRow=aoa.length+1; aoa.push(['','','','','TOTAL',null]);
  aoa.push([]);
  aoa.push(['Observaciones',$('#observaciones')?.value||'']);
  const ws=XLSX.utils.aoa_to_sheet(aoa);
  for(let r=firstDataRow;r<=lastDataRow;r++){
    const prod=ws[`A${r}`]?.v||'';
    if(prod && ws[`C${r}`] && ws[`D${r}`] && ws[`E${r}`]) ws[`F${r}`]={t:'n',f:`C${r}*D${r}*(1-E${r}/100)`};
  }
  ws[`F${subtotalRow}`]={t:'n',f:`SUMPRODUCT(C${firstDataRow}:C${lastDataRow},D${firstDataRow}:D${lastDataRow})`};
  ws[`F${baseRow}`]={t:'n',f:`SUM(F${firstDataRow}:F${lastDataRow})`};
  ws[`F${discountRow}`]={t:'n',f:`F${subtotalRow}-F${baseRow}`};
  ws[`F${ivaRow}`]={t:'n',f:`F${baseRow}*${ivaPct}/100`};
  ws[`F${totalRow}`]={t:'n',f:`F${baseRow}+F${ivaRow}`};
  ['C','F'].forEach(col=>{ for(let r=firstDataRow;r<=totalRow;r++) if(ws[`${col}${r}`]) ws[`${col}${r}`].z='#,##0.00 [$€-es-ES]'; });
  for(let r=firstDataRow;r<=lastDataRow;r++) if(ws[`E${r}`]) ws[`E${r}`].z='0.00';
  ws['!cols']=[{wch:25},{wch:55},{wch:13},{wch:11},{wch:14},{wch:16}];
  ws['!freeze']={xSplit:0,ySplit:12};
  XLSX.utils.book_append_sheet(wb,ws,'Presupuesto');
  const safe=String($('#numero')?.value||'hiper_antena').replace(/[^a-z0-9_-]/gi,'_');
  XLSX.writeFile(wb,`presupuesto_${safe}.xlsx`);
}

async function pdf(){
  // Si no hay productos reales, no abre ni genera ningún PDF.
  const tieneProductos = Array.isArray(lineas) && lineas.some(l => l && !l.separador && l.tipo !== 'separador');
  if(!tieneProductos) return;
  const { jsPDF } = window.jspdf || {};
  if(!jsPDF || !window.jspdf.jsPDF.API.autoTable){ alert('No se pudo cargar el generador PDF. Comprueba la conexión a internet para las librerías jsPDF.'); return; }
  const doc = new jsPDF({unit:'mm',format:'a4'});
  const c = calc();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const green = [13,77,49];
  const green2 = [31,143,95];
  const dark = [18,24,30];
  const light = [245,248,246];

  // Cabecera PDF compacta: logos y título centrados verticalmente.
  doc.setFillColor(255,255,255);
  doc.rect(0,0,pageW,27,'F');

  const logo = await imagenComoDataURL('logo_ajax.jpg');
  const logoHiper = await imagenComoDataURL('logo_hiper_antena.png');
  if(logo){ try{ doc.addImage(logo, 'JPEG', 14, 6.2, 26, 12.4); }catch(e){} }
  if(logoHiper){ try{ doc.addImage(logoHiper, 'PNG', pageW-48, 5.4, 34, 15.6); }catch(e){} }
  doc.setTextColor(13,77,49);
  doc.setFont('helvetica','normal'); doc.setFontSize(15.2);
  doc.text('Presupuesto Ajax', pageW/2, 14.4, {align:'center'});
  doc.setDrawColor(13,77,49);
  doc.setLineWidth(0.22);
  doc.line(14,24,pageW-14,24);

  const fechaPdf = formatFechaES($('#fecha').value || '') || '-';
  const estadoPdf = $('#estado').value || '-';
  const validezPdf = `${($('#validez').value || '30')} días`;
  const tiendaPdf = $('#tienda') ? ($('#tienda').value || '-') : '-';
  const numeroPdf = $('#numero').value || '-';
  const clientePdf = $('#cliente').value || '-';
  const telefonoPdf = $('#telefono').value || '-';
  const emailPdf = $('#email').value || '-';

  const fitPdf = (txt, max) => {
    txt = String(txt || '-');
    while(doc.getTextWidth(txt) > max && txt.length > 4){ txt = txt.slice(0,-2) + '…'; }
    return txt;
  };

  let y = 28;
  // Datos compactos en dos líneas, mismo ancho visual que la tabla
  doc.setFillColor(255,255,255);
  doc.setDrawColor(224,232,228);
  doc.roundedRect(14,y,pageW-28,16.2,2.2,2.2,'S');

  doc.setFont('helvetica','bold'); doc.setFontSize(7.2); doc.setTextColor(13,77,49);
  doc.text('Tienda:',18,y+5.5); doc.text('Cliente:',63,y+5.5); doc.text('Tel.:',122,y+5.5); doc.text('Email:',150,y+5.5);
  doc.text('Nº:',18,y+12.8); doc.text('Fecha:',62,y+12.8); doc.text('Estado:',103,y+12.8); doc.text('Validez:',148,y+12.8);

  doc.setFont('helvetica','normal'); doc.setFontSize(7.8); doc.setTextColor(25,31,36);
  doc.text(fitPdf(tiendaPdf,34),32,y+5.5);
  doc.text(fitPdf(clientePdf,42),80,y+5.5);
  doc.text(fitPdf(telefonoPdf,22),132,y+5.5);
  doc.text(fitPdf(emailPdf,36),161,y+5.5);
  doc.text(fitPdf(numeroPdf,35),25,y+12.8);
  doc.text(fitPdf(fechaPdf,28),75,y+12.8);
  doc.text(fitPdf(estadoPdf,32),117,y+12.8);
  doc.text(fitPdf(validezPdf,28),164,y+12.8);

  y += 19.5;

  const rows = lineas.map(l=>{
    if(l.separador){
      return [{content:String(l.name || 'SECCIÓN').toUpperCase(), colSpan:6, styles:{fillColor:[229,244,236], textColor:green, fontStyle:'bold', halign:'center', fontSize:8.6, cellPadding:2.1}}];
    }
    const bruto = (Number(l.pvp)||0)*(Number(l.qty)||0);
    const dto = Number(l.dto)||0;
    const total = bruto*(1-dto/100);
    const desc = descripcionPdfCorta(l);
    return [l.name, desc, fmt.format(Number(l.pvp)||0), String(l.qty||1), `${dto}%`, fmt.format(total)];
  });

  doc.autoTable({
    startY:y,
    head:[['Producto','Descripción','PVP','Cant.','Dto.','Total']],
    body: rows.length ? rows : [['Sin productos añadidos','','','','','']],
    margin:{left:14,right:14},
    tableWidth:'wrap',
    styles:{font:'helvetica',fontSize:7.6,cellPadding:1.75,lineColor:[225,231,228],lineWidth:0.1,textColor:[33,38,43],overflow:'linebreak'},
    headStyles:{fillColor:green,textColor:[255,255,255],fontStyle:'bold',halign:'center'},
    alternateRowStyles:{fillColor:[248,250,249]},
    columnStyles:{0:{cellWidth:48},1:{cellWidth:58},2:{halign:'right',cellWidth:22},3:{halign:'center',cellWidth:12},4:{halign:'right',cellWidth:16},5:{halign:'right',cellWidth:26}},
    didParseCell:function(data){
      if(data.section==='body' && data.cell.raw && data.cell.raw.colSpan===6){
        data.cell.styles.fillColor=[229,244,236];
        data.cell.styles.textColor=green;
        data.cell.styles.fontStyle='bold';
        data.cell.styles.halign='center';
      }
    }
  });

  y = doc.lastAutoTable.finalY + 6;
  if(($('#observaciones').value||'').trim()){
    if(y > 220){ doc.addPage(); y = 24; }
    doc.setTextColor(45,55,60); doc.setFont('helvetica','bold'); doc.setFontSize(9);
    doc.text('Observaciones',14,y);
    doc.setFont('helvetica','normal');
    const obsLines = doc.splitTextToSize($('#observaciones').value, 88);
    doc.text(obsLines,14,y+5);
    y += 10 + obsLines.length * 4;
  }
  if(y > 230){ doc.addPage(); y = 24; }

  // Resumen de importes: compacto, con aire arriba y sin margen excesivo abajo
  const totalBoxX = 112, totalBoxW = 84;
  doc.setFillColor(246,248,247);
  doc.setDrawColor(220,228,224);
  doc.roundedRect(totalBoxX,y-3,totalBoxW,31,3,3,'FD');
  const hayDescuentoReal = Number(c.dtoLineas||0) > 0.005;
  const resumen = hayDescuentoReal ? [
    ['Descuento aplicado', `-${fmt.format(c.dtoLineas)}`],
    ['Base imponible', fmt.format(c.base)],
    [`IVA (${c.ivaPct}%)`, fmt.format(c.iva)]
  ] : [
    ['Subtotal', fmt.format(c.subtotalBruto)],
    ['Base imponible', fmt.format(c.base)],
    [`IVA (${c.ivaPct}%)`, fmt.format(c.iva)]
  ];
  doc.setFontSize(8.7); doc.setTextColor(45,55,60); doc.setFont('helvetica','normal');
  resumen.forEach((r,i)=>{
    const yy = y + 2 + i*5.8;
    doc.text(r[0], totalBoxX+5, yy);
    doc.text(r[1], totalBoxX+totalBoxW-5, yy, {align:'right'});
  });
  doc.setFillColor(...green2);
  doc.roundedRect(totalBoxX, y+18, totalBoxW, 10.5, 2.5, 2.5, 'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10.8);
  doc.text('TOTAL', totalBoxX+5, y+25.1);
  doc.text(fmt.format(c.total), totalBoxX+totalBoxW-5, y+25.1, {align:'right'});

  // Pie en todas las páginas
  const pages = doc.internal.getNumberOfPages();
  for(let i=1;i<=pages;i++){
    doc.setPage(i);
    doc.setDrawColor(13,77,49);
    doc.line(14,pageH-15,pageW-14,pageH-15);
    doc.setTextColor(90,100,96); doc.setFont('helvetica','normal'); doc.setFontSize(8.5);
    doc.text('Hiper Antena - Tienda para los profesionales',14,pageH-9);
    doc.text(`Página ${i} de ${pages}`,pageW-14,pageH-9,{align:'right'});
  }

  doc.save(`presupuesto_${($('#numero').value||'hiper_antena').replace(/[^a-z0-9_-]/gi,'_')}.pdf`);
}



/* =====================================================
   FAMILIAS RÁPIDAS PRO
   Abre el catálogo filtrado por familias sin tocar CSV.
   ===================================================== */
const FAMILIAS_RAPIDAS = [
  {icon:'📹', title:'Cámaras', desc:'Bullet, Dome, Turret, Indoor', term:'camara vigilancia video bullet dome turret'},
  {icon:'💾', title:'Grabadores NVR', desc:'NVR, HDMI, canales, HDD', term:'nvr grabador videograbador camaras'},
  {icon:'🏠', title:'Hubs / centrales', desc:'Hub, 2G, 4G, SIM, WiFi', term:'hub central alarma panel'},
  {icon:'🚶', title:'Movimiento', desc:'Motion, PIR, cortina, exterior', term:'movimiento motion pir presencia'},
  {icon:'🚪', title:'Puertas / ventanas', desc:'DoorProtect, magnético', term:'puerta ventana doorprotect magnetico'},
  {icon:'🔥', title:'Incendio / CO', desc:'FireProtect, humo, calor, CO', term:'incendio humo fuego temperatura co'},
  {icon:'💧', title:'Agua / fugas', desc:'LeakProtect, WaterStop', term:'inundacion agua fuga humedad'},
  {icon:'🔔', title:'Sirenas', desc:'HomeSiren, StreetSiren', term:'sirena alarma sonora'},
  {icon:'⌨️', title:'Teclados / mandos', desc:'KeyPad, Tag, Pass, Button', term:'teclado mando tag pass boton'},
  {icon:'🔌', title:'Automatización', desc:'Relay, WallSwitch, Socket', term:'rele automatizacion enchufe domotica'},
  {icon:'🔋', title:'Alimentación', desc:'PSU, 12V, baterías', term:'alimentador fuente 12v bateria psu'},
  {icon:'🧩', title:'Soportes / accesorios', desc:'Mount, bracket, holder, cajas', term:'soporte bracket montaje holder junctionbox'},
  {icon:'🌐', title:'Red / PoE', desc:'Switch PoE, inyector, LAN', term:'switch poe inyector ethernet red 48v'},
  {icon:'🧱', title:'Barreras', desc:'Perimetral, solar, exterior', term:'barrera movimiento perimetral solar exterior'}
];
function renderFamiliasRapidas(){
  const grid = $('#familiasGrid');
  if(!grid) return;
  grid.innerHTML = FAMILIAS_RAPIDAS.map((f,i)=>`<button type="button" class="family-chip" data-i="${i}"><strong>${escapeHtml(f.icon)} ${escapeHtml(f.title)}</strong><span>${escapeHtml(f.desc)}</span></button>`).join('');
  grid.querySelectorAll('.family-chip').forEach(btn=>btn.addEventListener('click',()=>{
    const f = FAMILIAS_RAPIDAS[Number(btn.dataset.i)];
    cerrarFamiliasRapidas();
    abrirCatalogo();
    const filter = $('#catalogFilter');
    if(filter){ filter.value = f.term; }
    pintarCatalogPanel(f.term);
  }));
}
function abrirFamiliasRapidas(){
  const modal = $('#familiasModal');
  if(!modal) return;
  renderFamiliasRapidas();
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
}
function cerrarFamiliasRapidas(){
  hxResetModalQty('explorer');
  hxResetModalSession('explorer');
  const modal = $('#familiasModal');
  if(!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}

window.setLinea=setLinea; window.delLinea=delLinea; window.addLineaManual=addLineaManual; window.addSeparador=addSeparador; window.moverLinea=moverLinea;
document.addEventListener('DOMContentLoaded',()=>{
  aplicarTemaGuardado();
  $('#themeToggle')?.addEventListener('click',alternarTema);
  cargarLocal(); render(); cargarCatalogo();
  $('#buscador').addEventListener('input',resolverDesdeInput);
  $('#buscador').addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault(); moverActivo(1);} 
    if(e.key==='ArrowUp'){e.preventDefault(); moverActivo(-1);} 
    if(e.key==='Enter'){e.preventDefault(); addLinea();}
    if(e.key==='Escape') $('#resultados').classList.add('hidden');
  });
  document.addEventListener('click',e=>{ if(!e.target.closest('.search-wrap')) $('#resultados').classList.add('hidden'); });
  $('#producto').addEventListener('change',e=>{ if(e.target.value!=='') seleccionarProducto(Number(e.target.value), true); });
  $('#btnCatalogo')?.addEventListener('click',abrirCatalogo);
  $('#catalogClose')?.addEventListener('click',cerrarCatalogo);
  $('#catalogCancel')?.addEventListener('click',cerrarCatalogo);
  $('#catalogBackdrop')?.addEventListener('click',cerrarCatalogo);
  $('#catalogFilter')?.addEventListener('input',e=>{ pintarCatalogPanel(e.target.value); });
  $('#btnFamilias')?.addEventListener('click',abrirFamiliasRapidas);
  $('#familiasClose')?.addEventListener('click',cerrarFamiliasRapidas);
  $('#familiasCancel')?.addEventListener('click',cerrarFamiliasRapidas);
  $('#familiasBackdrop')?.addEventListener('click',cerrarFamiliasRapidas);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') cerrarCatalogo(); });
  $('#add').addEventListener('click',addLinea); $('#btnManual').addEventListener('click',addLineaManual); $('#btnSeparador')?.addEventListener('click',addSeparador);
  $('#btnPDF').addEventListener('click',pdf); $('#btnExcel')?.addEventListener('click',exportarExcel); $('#btnSave').addEventListener('click',guardar); $('#btnDuplicate').addEventListener('click',duplicarPresupuesto); $('#btnLoadSaved').addEventListener('click',cargarPresupuestoGuardado); $('#btnDeleteSaved').addEventListener('click',borrarPresupuestoGuardado); $('#btnClear').addEventListener('click',limpiar);
  $('#dtoGeneral').addEventListener('input',aplicarDescuentoGeneralALineas); $('#iva').addEventListener('input',render);
});




/* =====================================================
   BUSCADOR ESTABLE v1.6.3.1
   Regla principal: TODO lo que esté en el CSV debe salir.
   El conocimiento mejora familia/descripción, pero nunca oculta.
   ===================================================== */
function textoBusquedaEstable(p){
  const desc = (typeof descripcionProducto === 'function') ? descripcionProducto(p).desc : '';
  let extra = '';
  try{ extra = [textoKnowledgeProducto(p), etiquetasProducto(p).join(' ')].join(' '); }catch(e){ extra=''; }
  return normaliza([p.name,p.brand,desc,extra].join(' '));
}
function esNvrReal(p){ const n=normaliza(p.name); return n.startsWith('aj-nvr') || n.startsWith('nvr') || n.includes('nvrkit'); }
function esFuenteNvr(p){ const n=normaliza(p.name); return n.includes('psu-nvr') || (n.includes('psu') && n.includes('nvr')) || n.includes('dc12v-psu-nvr'); }
function esNvrHdmi(p){ const n=normaliza(p.name); if(!esNvrReal(p)) return false; return n.includes('hac') || n.includes('hdc') || n.includes('h2d') || n.includes('hdmi'); }
function esProductoWifi(p){ const n=normaliza(p.name); return n.includes('hub2plus') || n.includes('superior-hub-g3') || n.includes('megahub') || n.includes('indoorcam') || n.includes('doorbell'); }
function esSwitchPoe(p){ const n=normaliza(p.name); return n.includes('vdms105gp') || n.includes('vdms108gp') || (n.includes('switch') && n.includes('poe')); }
function esInyectorPoe(p){ const n=normaliza(p.name); return n.includes('inj-poe') || n.includes('injector-poe') || n.includes('inyector-poe'); }
function esDiscoDuro(p){ const n=normaliza(p.name); return /^hd\d+tb/.test(n) || n.includes('disco') || n.includes('hdd'); }
function esTarjetaSD(p){ const n=normaliza(p.name); return n.includes('hs-tf') || n.includes('microsd') || n.includes('micro-sd') || n.includes('tarjeta-sd'); }
function esBarrera(p){ const n=normaliza(p.name); return n.includes('abe-150') || n.includes('barrera'); }
function scoreProducto(p, term){
  const q = normaliza(term).trim(); if(!q) return 0;
  const n = normaliza(p.name), b = normaliza(p.brand), texto = textoBusquedaEstable(p);
  const parts = q.split(/\s+/).filter(Boolean); let score = 0;
  if(q === 'nvr' || q === 'grabador' || q === 'grabadores' || q === 'videograbador') return esNvrReal(p) ? 10000 + ((n.includes('hac')||n.includes('hdc'))?500:0) : 0;
  if(q.includes('fuente nvr') || q.includes('psu nvr') || q.includes('alimentacion nvr') || q.includes('alimentación nvr')) return esFuenteNvr(p) ? 10000 : 0;
  if(q === 'hdmi') return esNvrHdmi(p) ? 10000 : 0;
  if(q === 'wifi' || q === 'wi-fi' || q === 'wi fi') return esProductoWifi(p) ? 10000 : 0;
  if(q.includes('switch poe')) return esSwitchPoe(p) ? 10000 : 0;
  if(q.includes('inyector poe') || q.includes('injector poe')) return esInyectorPoe(p) ? 10000 : 0;
  if(q === 'disco' || q === 'discos' || q === 'hdd' || q.includes('disco duro')) return esDiscoDuro(p) ? 10000 : 0;
  if(q === 'tarjeta sd' || q === 'microsd' || q === 'micro sd' || q === 'sd') return esTarjetaSD(p) ? 10000 : 0;
  if(q === 'barrera' || q.includes('abe') || q.includes('perimetral')) return esBarrera(p) ? 10000 : (texto.includes(q)?100:0);
  if(n === q) score += 20000;
  if(n.startsWith(q)) score += 12000;
  if(n.includes(q)) score += 9000;
  if(b.includes(q)) score += 200;
  for(const part of parts){
    if(n.split(/[^a-z0-9]+/).includes(part)) score += 5000;
    else if(n.includes(part)) score += 3000;
    if(texto.includes(part)) score += 450;
  }
  if(texto.includes(q)) score += 800;
  return score;
}
function buscar(term){
  const q = normaliza(term).trim(); if(!q) return [];
  const arr = productos.map((p,i)=>({p,i,score:scoreProducto(p, q)})).filter(x=>x.score>0);
  arr.sort((a,b)=>b.score-a.score || a.p.name.localeCompare(b.p.name,'es'));
  return arr.slice(0,300);
}
function buscarCatalogo(term=''){
  const q=String(term||'').trim();
  if(!q) return productos.map((p,i)=>({p,i,score:1})).sort((a,b)=>a.p.name.localeCompare(b.p.name,'es'));
  return buscar(q);
}
// fuerza version visible
try{ document.addEventListener('DOMContentLoaded',()=>{ document.querySelectorAll('.creator').forEach(el=>{ el.textContent = el.textContent.replace(/v\d+\.\d+(?:\.\d+)?(?:\.\d+)?\s*PRO/,'v1.6.3.1 PRO'); }); }); }catch(e){}

/* =====================================================
   MOTOR PRO v1.6.4 - Automatización, mecanismos, red/PoE y almacenamiento
   CSV siempre manda: el conocimiento solo suma, nunca oculta.
   ===================================================== */
const APP_VERSION_164 = 'v1.6.4 PRO';

function metaProducto164(p){
  const raw = String((p && p.name) || '');
  const n = normaliza(raw);
  const tags = [];
  const add = (...xs)=>xs.forEach(x=>{ if(x) tags.push(x); });

  if(n.includes('abe-150') || n.includes('barrera')){
    add('barrera','perimetral','proteccion perimetral','exterior','intrusion','sensor barrera');
    return {icon:'🛡️', family:'Protección perimetral', sub:'Barreras', desc:'Barrera de protección perimetral', tags};
  }
  if(n.includes('vdms105gp')){
    add('switch poe','poe','switch','red','ethernet','5 puertos','5p','camara ip','cctv','alimentacion poe');
    return {icon:'🌐', family:'Red / PoE', sub:'Switches PoE', desc:'Switch PoE de 5 puertos para red y cámaras IP', tags};
  }
  if(n.includes('vdms108gp')){
    add('switch poe','poe','switch','red','ethernet','8 puertos','8p','camara ip','cctv','alimentacion poe');
    return {icon:'🌐', family:'Red / PoE', sub:'Switches PoE', desc:'Switch PoE de 8 puertos para red y cámaras IP', tags};
  }
  if(n.includes('inj-poe') || n.includes('injector-poe') || n.includes('inyector-poe')){
    add('inyector poe','injector poe','poe','red','ethernet','alimentacion poe','camara ip','cctv');
    return {icon:'⚡', family:'Red / PoE', sub:'Inyectores PoE', desc:'Inyector PoE para alimentar dispositivos de red por cable Ethernet', tags};
  }
  if(/^hd\d+tb/.test(n) || n.includes('hdd') || n.includes('disco-duro') || n.includes('disco duro')){
    const cap = (raw.match(/HD(\d+)TB/i)||[])[1];
    add('disco','disco duro','hdd','almacenamiento','grabacion','grabación','nvr','videovigilancia','cctv', cap ? `${cap}tb` : '');
    return {icon:'💾', family:'Almacenamiento', sub:'Discos duros', desc:`Disco duro ${cap ? cap + ' TB ' : ''}para grabación en NVR`, tags};
  }
  if(n.includes('hs-tf') || n.includes('microsd') || n.includes('micro-sd') || n.includes('tarjeta-sd') || n.includes('tarjeta sd')){
    const cap = (raw.match(/(32|64|128|256|512)G/i)||[])[1];
    add('tarjeta sd','micro sd','microsd','memoria','tarjeta memoria','almacenamiento','grabacion','grabación','camara','cctv', cap ? `${cap}gb` : '');
    return {icon:'💾', family:'Almacenamiento', sub:'Tarjetas microSD', desc:`Tarjeta microSD ${cap ? cap + ' GB ' : ''}para almacenamiento y grabación`, tags};
  }

  if(n.includes('solobutton')){
    add('solobutton','mecanismo','automatizacion','automatización','lightswitch','lightcore','interruptor','tecla','boton interruptor','panel','tapa','pulsador luz');
    return {icon:'💡', family:'Confort y automatización', sub:'Mecanismos LightSwitch', desc:'Panel táctil SoloButton para mecanismos LightSwitch', tags};
  }
  if(n.includes('centerbutton')){
    add('centerbutton','mecanismo','automatizacion','automatización','lightswitch','lightcore','interruptor','tecla central','boton central','panel','tapa','pulsador luz');
    return {icon:'💡', family:'Confort y automatización', sub:'Mecanismos LightSwitch', desc:'Botón central táctil para mecanismos LightSwitch', tags};
  }
  if(n.includes('sidebutton')){
    add('sidebutton','mecanismo','automatizacion','automatización','lightswitch','lightcore','interruptor','tecla lateral','boton lateral','panel','tapa','pulsador luz');
    return {icon:'💡', family:'Confort y automatización', sub:'Mecanismos LightSwitch', desc:'Botón lateral táctil para mecanismos LightSwitch', tags};
  }
  if(n.includes('lightcore')){
    let desc = 'Módulo LightCore para interruptor inteligente AJAX';
    if(n.includes('dimmer')) desc = 'Módulo LightCore Dimmer para regulación de iluminación';
    else if(n.includes('2g2w')) desc = 'Módulo LightCore de 2 bandas y 2 vías para interruptor inteligente';
    else if(n.includes('2g')) desc = 'Módulo LightCore de 2 bandas para interruptor inteligente';
    else if(n.includes('2w')) desc = 'Módulo LightCore de 2 vías para interruptor inteligente';
    else if(n.includes('cross')) desc = 'Módulo LightCore Crossover para interruptor de cruce';
    add('lightcore','lightswitch','interruptor','luz','iluminacion','iluminación','domotica','domótica','automatizacion','mecanismo','modulo interruptor');
    return {icon:'💡', family:'Confort y automatización', sub:'LightSwitch', desc, tags};
  }

  if(n.includes('solocover')){
    add('solocover','outletcore','outlet','enchufe','tapa','tapa enchufe','mecanismo','cover','embellecedor','base enchufe','automatizacion');
    return {icon:'🔌', family:'Confort y automatización', sub:'Tapas OutletCore', desc:'Tapa SoloCover para OutletCore / base de enchufe AJAX', tags};
  }
  if(n.includes('centercover')){
    add('centercover','outletcore','outlet','enchufe','tapa central','tapa enchufe','mecanismo','cover','embellecedor','base enchufe','automatizacion');
    return {icon:'🔌', family:'Confort y automatización', sub:'Tapas OutletCore', desc:'Tapa central CenterCover para OutletCore / base de enchufe AJAX', tags};
  }
  if(n.includes('sidecover')){
    add('sidecover','outletcore','outlet','enchufe','tapa lateral','tapa enchufe','mecanismo','cover','embellecedor','base enchufe','automatizacion');
    return {icon:'🔌', family:'Confort y automatización', sub:'Tapas OutletCore', desc:'Tapa lateral SideCover para OutletCore / base de enchufe AJAX', tags};
  }
  if(n.includes('outletcore-basic')){
    add('outletcore','outlet','enchufe','base enchufe','toma corriente','mecanismo','automatizacion','con tierra');
    return {icon:'🔌', family:'Confort y automatización', sub:'Bases de enchufe', desc:'Módulo OutletCore Basic para base de enchufe con conexión a tierra', tags};
  }
  if(n.includes('outletcore-lan')){
    add('outletcore','outlet lan','ethernet','red','lan','rj45','mecanismo','toma datos','base ethernet');
    return {icon:'🌐', family:'Confort y automatización', sub:'Bases de enchufe', desc:'Módulo OutletCore LAN para base Ethernet de dos puertos', tags};
  }
  if(n.includes('outletcore-smart')){
    add('outletcore','outlet smart','enchufe inteligente','monitor consumo','consumo electrico','toma corriente','automatizacion');
    return {icon:'🔌', family:'Confort y automatización', sub:'Bases de enchufe', desc:'Módulo OutletCore inteligente con monitor de consumo eléctrico', tags};
  }
  if(n.includes('coverplate')){
    add('coverplate','tapa','caja montaje','surfacebox','mecanismo','embellecedor','outlet','lightswitch');
    return {icon:'🧩', family:'Confort y automatización', sub:'Mecanismos y tapas', desc:'Tapa de la caja de montaje para mecanismos AJAX', tags};
  }
  if(n.includes('frame-')){
    add('frame','marco','mecanismo','lightswitch','outlet','enchufe','interruptor','automatizacion','embellecedor');
    return {icon:'🧩', family:'Confort y automatización', sub:'Marcos', desc:'Marco para mecanismos LightSwitch y Outlet AJAX', tags};
  }
  if(n.includes('surfacebox')){
    add('surfacebox','caja superficie','caja montaje','mecanismo','lightswitch','outlet','enchufe','interruptor','automatizacion');
    return {icon:'🧩', family:'Confort y automatización', sub:'Cajas de superficie', desc:'Caja de montaje en superficie para LightSwitch u Outlet', tags};
  }
  if(n.includes('bypass-dimmer')){
    add('bypass','dimmer','lightswitch','regulador','luz','iluminacion','automatizacion');
    return {icon:'💡', family:'Confort y automatización', sub:'Accesorios LightSwitch', desc:'Bypass para LightSwitch Dimmer', tags};
  }
  if(n.includes('socket')){
    add('socket','enchufe inteligente','enchufe','monitor consumo','consumo electrico','automatizacion','domotica');
    return {icon:'🔌', family:'Confort y automatización', sub:'Enchufes inteligentes', desc:'Enchufe inteligente con monitor de consumo eléctrico', tags};
  }
  if(n.includes('wallswitch')){
    add('wallswitch','rele potencia','relé potencia','relay','automatizacion','domotica','control remoto','110v','230v','alimentacion');
    return {icon:'🔌', family:'Confort y automatización', sub:'Relés', desc:'Relé de potencia para controlar alimentación 110/230 V en remoto', tags};
  }
  if(n === 'aj-relay' || n.endsWith('relay')){
    add('relay','rele','relé','contacto seco','automatizacion','domotica','puerta garaje','porton','control remoto');
    return {icon:'🔌', family:'Confort y automatización', sub:'Relés', desc:'Relé inalámbrico de contacto seco', tags};
  }
  return null;
}

const descripcionProductoAnterior_164 = descripcionProducto;
descripcionProducto = function(p){
  const meta = metaProducto164(p);
  if(meta) return {icon:meta.icon, desc:meta.desc, family:meta.family, official:meta.sub};
  return descripcionProductoAnterior_164(p);
};
function textoBusqueda164(p){
  const meta = metaProducto164(p);
  const base = [p.name, p.brand, descripcionProducto(p).desc];
  if(meta) base.push(meta.family, meta.sub, meta.tags.join(' '));
  try{ base.push(textoKnowledgeProducto(p), etiquetasProducto(p).join(' ')); }catch(e){}
  return normaliza(base.join(' '));
}
function esMecanismo164(p){ const m=metaProducto164(p); return !!(m && m.family.includes('Confort') && (m.sub.includes('Mecanismos') || m.sub.includes('Tapas') || m.sub.includes('Marcos') || m.sub.includes('LightSwitch') || m.sub.includes('Outlet') || m.sub.includes('Cajas'))); }
function esRedPoe164(p){ const m=metaProducto164(p); return !!(m && m.family === 'Red / PoE'); }
function esAlmacenamiento164(p){ const m=metaProducto164(p); return !!(m && m.family === 'Almacenamiento'); }
const scoreProductoAnterior_164 = scoreProducto;
scoreProducto = function(p, term){
  const q = normaliza(term).trim();
  if(!q) return 0;
  const texto = textoBusqueda164(p);
  const n = normaliza(p.name);
  const meta = metaProducto164(p);
  if(['mecanismo','mecanismos','tapa','tapas','panel','paneles','embellecedor','embellecedores'].includes(q)) return esMecanismo164(p) ? 12000 : 0;
  if(q.includes('solocover') || q.includes('solo cover')) return n.includes('solocover') ? 15000 : 0;
  if(q.includes('centercover') || q.includes('center cover')) return n.includes('centercover') ? 15000 : 0;
  if(q.includes('sidecover') || q.includes('side cover')) return n.includes('sidecover') ? 15000 : 0;
  if(q.includes('solobutton') || q.includes('solo button')) return n.includes('solobutton') ? 15000 : 0;
  if(q.includes('centerbutton') || q.includes('center button')) return n.includes('centerbutton') ? 15000 : 0;
  if(q.includes('sidebutton') || q.includes('side button')) return n.includes('sidebutton') ? 15000 : 0;
  if(q.includes('outletcore') || q.includes('outlet core')) return n.includes('outletcore') || n.includes('solocover') || n.includes('centercover') || n.includes('sidecover') ? 12000 : 0;
  if(q.includes('lightcore') || q.includes('light core')) return n.includes('lightcore') || n.includes('solobutton') || n.includes('centerbutton') || n.includes('sidebutton') ? 12000 : 0;
  if(['poe','switch poe','switch','inyector poe','injector poe','red poe'].some(x=>q===x || q.includes(x))){
    if(q.includes('inyector') || q.includes('injector')) return meta && meta.sub === 'Inyectores PoE' ? 15000 : 0;
    if(q.includes('switch')) return meta && meta.sub === 'Switches PoE' ? 15000 : 0;
    return esRedPoe164(p) ? 13000 : scoreProductoAnterior_164(p, q);
  }
  if(['almacenamiento','memoria','memorias'].includes(q)) return esAlmacenamiento164(p) ? 13000 : 0;
  if(q.includes('disco') || q==='hdd') return meta && meta.sub === 'Discos duros' ? 15000 : 0;
  if(q.includes('tarjeta') || q.includes('microsd') || q === 'sd' || q.includes('micro sd')) return meta && meta.sub === 'Tarjetas microSD' ? 15000 : 0;
  if(q.includes('automatismo') || q.includes('automatizacion') || q.includes('automatización') || q.includes('domotica') || q.includes('domótica')) return meta && meta.family === 'Confort y automatización' ? 12000 : 0;
  if(q.includes('panico') || q.includes('pánico') || q.includes('emergencia')){ if(n.includes('solobutton') || n.includes('centerbutton') || n.includes('sidebutton')) return 0; }
  let score = scoreProductoAnterior_164(p, q);
  if(texto.includes(q)) score += meta ? 1800 : 300;
  const parts = q.split(/\s+/).filter(Boolean);
  for(const part of parts){ if(texto.includes(part)) score += meta ? 550 : 120; }
  return score;
};
try{ document.addEventListener('DOMContentLoaded',()=>{ document.querySelectorAll('.creator').forEach(el=>{ el.textContent = el.textContent.replace(/v\d+\.\d+(?:\.\d+)?(?:\.\d+)?\s*PRO/g, APP_VERSION_164); }); }); }catch(e){}


/* =====================================================
   MOTOR PRO v1.6.5 - Familias corregidas
   - Red / PoE muestra switches e inyector juntos en familia.
   - Almacenamiento muestra discos y tarjetas microSD.
   - CSV siempre manda: producto nuevo sale por referencia/nombre.
   ===================================================== */
const APP_VERSION_165 = 'v1.6.5 PRO';

function esSwitchPoe165(p){
  const n = normaliza((p && p.name) || '');
  return n.includes('vdms105gp') || n.includes('vdms108gp') || (n.includes('switch') && n.includes('poe'));
}
function esInyectorPoe165(p){
  const n = normaliza((p && p.name) || '');
  return n.includes('inj-poe') || n.includes('injector-poe') || n.includes('inyector-poe');
}
function esRedPoe165(p){ return esSwitchPoe165(p) || esInyectorPoe165(p); }
function esDiscoDuro165(p){
  const n = normaliza((p && p.name) || '');
  return /^hd\d+tb/.test(n) || n.includes('disco') || n.includes('hdd');
}
function esTarjetaSD165(p){
  const n = normaliza((p && p.name) || '');
  return n.includes('hs-tf') || n.includes('microsd') || n.includes('micro-sd') || n.includes('tarjeta-sd') || n.includes('tarjeta sd');
}
function esAlmacenamiento165(p){ return esDiscoDuro165(p) || esTarjetaSD165(p); }

const metaProductoAnterior_165 = typeof metaProducto164 === 'function' ? metaProducto164 : null;
metaProducto164 = function(p){
  const raw = String((p && p.name) || '');
  const n = normaliza(raw);
  const tags = [];
  const add = (...xs)=>xs.forEach(x=>{ if(x) tags.push(x); });

  if(esSwitchPoe165(p)){
    const puertos = n.includes('108') ? '8' : (n.includes('105') ? '5' : '');
    add('switch poe','poe','switch','red','ethernet','lan','gigabit','camaras ip','videovigilancia','alimentacion poe', puertos ? `${puertos} puertos` : '', puertos ? `switch poe ${puertos}` : '');
    return {icon:'🌐', family:'Red / PoE', sub:'Switches PoE', desc:`Switch PoE${puertos ? ' de ' + puertos + ' puertos' : ''} para red, cámaras IP y alimentación PoE`, tags};
  }
  if(esInyectorPoe165(p)){
    add('inyector poe','injector poe','poe','red','ethernet','lan','alimentacion poe','camara ip','cctv','30w','poe injector');
    return {icon:'⚡', family:'Red / PoE', sub:'Inyectores PoE', desc:'Inyector PoE para alimentar dispositivos de red por cable Ethernet', tags};
  }
  if(esDiscoDuro165(p)){
    const cap = (raw.match(/HD(\d+)TB/i)||[])[1];
    add('disco','disco duro','hdd','almacenamiento','memoria','grabacion','grabación','nvr','videovigilancia','cctv', cap ? `${cap}tb` : '', cap ? `disco ${cap}tb` : '');
    return {icon:'💾', family:'Almacenamiento', sub:'Discos duros', desc:`Disco duro ${cap ? cap + ' TB ' : ''}para grabación en NVR`, tags};
  }
  if(esTarjetaSD165(p)){
    const cap = (raw.match(/(32|64|128|256|512)G/i)||[])[1];
    add('tarjeta sd','micro sd','microsd','memoria','tarjeta memoria','almacenamiento','grabacion','grabación','camara','cctv', cap ? `${cap}gb` : '', cap ? `micro sd ${cap}gb` : '');
    return {icon:'💾', family:'Almacenamiento', sub:'Tarjetas microSD', desc:`Tarjeta microSD ${cap ? cap + ' GB ' : ''}para almacenamiento y grabación`, tags};
  }
  return metaProductoAnterior_165 ? metaProductoAnterior_165(p) : null;
};

const scoreProductoAnterior_165 = scoreProducto;
scoreProducto = function(p, term){
  const q = normaliza(term).trim();
  if(!q) return 0;
  const n = normaliza((p && p.name) || '');

  // Familias completas: aquí se corrige el problema de Red / PoE.
  if(q === 'red poe' || q === 'red / poe' || q === 'poe' || q === 'red' || q === 'ethernet'){
    return esRedPoe165(p) ? 20000 : scoreProductoAnterior_165(p, q);
  }
  if(q === 'switch poe' || q === 'switch' || q === 'switches poe'){
    return esSwitchPoe165(p) ? 22000 : 0;
  }
  if(q === 'inyector poe' || q === 'injector poe' || q === 'inyector' || q === 'injector'){
    return esInyectorPoe165(p) ? 22000 : 0;
  }
  if(q === 'almacenamiento' || q === 'memoria' || q === 'memorias' || q === 'grabacion' || q === 'grabación'){
    return esAlmacenamiento165(p) ? 20000 : scoreProductoAnterior_165(p, q);
  }
  if(q === 'disco' || q === 'discos' || q === 'hdd' || q.includes('disco duro')){
    return esDiscoDuro165(p) ? 22000 : 0;
  }
  if(q === 'sd' || q === 'tarjeta sd' || q === 'microsd' || q === 'micro sd' || q.includes('tarjeta memoria')){
    return esTarjetaSD165(p) ? 22000 : 0;
  }

  // Fallback obligatorio al CSV: referencia/nombre siempre puntúa aunque no exista conocimiento.
  let score = scoreProductoAnterior_165(p, q);
  if(n === q) score += 30000;
  if(n.startsWith(q)) score += 18000;
  if(n.includes(q)) score += 12000;
  return score;
};

// Familias rápidas añadidas/corregidas sin tocar la UI existente.
try{
  const existeRed = FAMILIAS_RAPIDAS.some(f=>normaliza(f.title).includes('red'));
  const existeAlm = FAMILIAS_RAPIDAS.some(f=>normaliza(f.title).includes('almacenamiento'));
  const red = FAMILIAS_RAPIDAS.find(f=>normaliza(f.title).includes('red'));
  if(red){ red.term = 'poe'; red.desc = 'Switches PoE e inyector'; }
  if(!existeRed) FAMILIAS_RAPIDAS.push({icon:'🌐', title:'Red / PoE', desc:'Switches PoE e inyector', term:'poe'});
  if(!existeAlm) FAMILIAS_RAPIDAS.push({icon:'💾', title:'Almacenamiento', desc:'Discos duros y tarjetas SD', term:'almacenamiento'});
}catch(e){}

try{
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('.creator').forEach(el=>{
      el.textContent = el.textContent.replace(/v\d+\.\d+(?:\.\d+)?(?:\.\d+)?\s*PRO/g, APP_VERSION_165);
    });
  });
}catch(e){}

/* =====================================================
   MOTOR PRO v1.6.6 - Fix Incendio/CO y Baterías rápidas
   - Evita falsos positivos tipo CenterCover al buscar CO/incendio.
   - Baterías aparecen rápido por bateria/battery/pila.
   - Mantiene CSV como fuente principal y no oculta productos nuevos.
   ===================================================== */
const APP_VERSION_166 = 'v1.6.6 PRO';

function esProductoIncendio166(p){
  const n = normaliza((p && p.name) || '');
  return n.includes('fireprotect') || n.includes('manualcallpoint') || n.includes('en54') || n.includes('fire');
}
function esProductoCO166(p){
  const n = normaliza((p && p.name) || '');
  // CO real en Ajax suele venir marcado con C dentro de FireProtect 2 o Plus.
  if(!esProductoIncendio166(p)) return false;
  return n.includes('fireprotectplus') || n.includes('-c-') || n.includes('-hc-') || n.includes('-hsc-') || n.includes('(co)') || n.includes('co');
}
function esProductoBateria166(p){
  const n = normaliza((p && p.name) || '');
  return n.includes('battery') || n.includes('batt') || n.includes('internalbattery') || n.includes('batterybox') || n.includes('batterykit') || n.includes('hubbatt');
}

const metaProductoAnterior_166 = typeof metaProducto164 === 'function' ? metaProducto164 : null;
metaProducto164 = function(p){
  const n = normaliza((p && p.name) || '');
  if(esProductoBateria166(p)){
    return {
      icon:'🔋',
      family:'Alimentación',
      sub:'Baterías',
      desc: n.includes('internalbattery') ? 'Batería interna para equipos AJAX' : (n.includes('batterybox') ? 'Caja de batería para alimentación de respaldo' : 'Batería o kit de alimentación de respaldo'),
      tags:['bateria','batería','battery','batterybox','batterykit','pila','alimentacion','alimentación','respaldo','backup','autonomia','autonomía']
    };
  }
  return metaProductoAnterior_166 ? metaProductoAnterior_166(p) : null;
};

const scoreProductoAnterior_166 = scoreProducto;
scoreProducto = function(p, term){
  const q = normaliza(term).trim();
  if(!q) return 0;

  // Incendio / CO: no permitir que palabras cortas como "co" arrastren CenterCover, SoloCover, etc.
  const pideIncendio = q.includes('incendio') || q.includes('humo') || q.includes('fuego') || q.includes('calor') || q.includes('temperatura') || q.includes('fireprotect') || q.includes('en54') || q.includes('alarma incendio');
  const pideCO = q === 'co' || q.includes(' co ') || q.includes('monoxido') || q.includes('monóxido') || q.includes('carbono');
  if(pideIncendio || pideCO){
    if(pideCO && !pideIncendio) return esProductoCO166(p) ? 25000 : 0;
    if(pideCO && pideIncendio) return esProductoCO166(p) ? 26000 : (esProductoIncendio166(p) ? 18000 : 0);
    return esProductoIncendio166(p) ? 22000 : 0;
  }

  // Baterías: búsqueda rápida y limpia.
  if(q === 'bateria' || q === 'batería' || q === 'baterias' || q === 'baterías' || q === 'battery' || q === 'batteries' || q === 'pila' || q === 'pilas'){
    return esProductoBateria166(p) ? 25000 : 0;
  }
  if(q.includes('batterybox') || q.includes('battery box')){
    return normaliza((p && p.name) || '').includes('batterybox') ? 26000 : 0;
  }
  if(q.includes('batterykit') || q.includes('battery kit')){
    return normaliza((p && p.name) || '').includes('batterykit') ? 26000 : 0;
  }

  return scoreProductoAnterior_166(p, q);
};

try{
  const inc = FAMILIAS_RAPIDAS.find(f=>normaliza(f.title).includes('incendio'));
  if(inc){ inc.term = 'incendio'; inc.desc = 'FireProtect, humo, calor y CO'; }
  const ali = FAMILIAS_RAPIDAS.find(f=>normaliza(f.title).includes('alimentacion') || normaliza(f.title).includes('alimentación'));
  if(ali){ ali.term = 'bateria'; ali.desc = 'Baterías, PSU y alimentación'; }
  const existeBat = FAMILIAS_RAPIDAS.some(f=>normaliza(f.title).includes('bateria') || normaliza(f.title).includes('batería'));
  if(!existeBat) FAMILIAS_RAPIDAS.push({icon:'🔋', title:'Baterías', desc:'BatteryBox, BatteryKit e internas', term:'bateria'});
}catch(e){}

try{
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('.creator').forEach(el=>{
      el.textContent = el.textContent.replace(/v\d+\.\d+(?:\.\d+)?(?:\.\d+)?\s*PRO/g, APP_VERSION_166);
    });
  });
}catch(e){}



/* =====================================================
   PRO v1.7.5 - CARGA CSV EXTERNO ROBUSTA + BÚSQUEDA ESTABLE
   Objetivo:
   - El CSV externo manda SIEMPRE.
   - Productos nuevos aparecen por referencia/nombre aunque no tengan ficha.
   - El conocimiento solo enriquece; no puede ocultar productos.
   - Parser acepta ;, tabuladores, columnas extra y líneas pegadas simples.
   - Descripciones existentes se mantienen.
   ===================================================== */
const APP_VERSION_175 = 'v1.7.5 PRO';

function parseCSVRobusto175(txt){
  txt = String(txt || '').replace(/^\uFEFF/, '').replace(/\r/g, '').trim();
  if(!txt) return [];

  const rawLines = txt.split('\n').map(l => l.trim()).filter(Boolean);
  if(!rawLines.length) return [];

  const splitLine = (line) => {
    if(line.includes(';')) return splitCSVLine(line, ';');
    if(line.includes('\t')) return line.split('\t').map(x => x.trim());

    // Fallback para líneas pegadas tipo: "RACK-WALL        168.00"
    const m = line.match(/^(.+?)\s+([0-9]+(?:[.,][0-9]+)?)$/);
    if(m) return [m[1].trim(), '', m[2].trim()];

    return [line.trim(), '', '0'];
  };

  const first = splitLine(rawLines[0]);
  const headerNorm = first.map(h => normaliza(h).replace(/[^a-z0-9]/g,''));
  const hasHeader = headerNorm.some(h => ['name','nombre','producto','descripcion','referencia','codigo','brand','marca','fabricante','pvp','precio','price','importe'].includes(h));

  let start = hasHeader ? 1 : 0;
  let idxName = 0, idxBrand = 1, idxPvp = 2;

  if(hasHeader){
    idxName = headerNorm.findIndex(h => ['name','nombre','producto','descripcion','referencia','codigo','ref'].includes(h));
    idxBrand = headerNorm.findIndex(h => ['brand','marca','fabricante'].includes(h));
    idxPvp = headerNorm.findIndex(h => ['pvp','precio','price','importe'].includes(h));
    if(idxName < 0) idxName = 0;
  }

  const rows = [];
  for(const line of rawLines.slice(start)){
    const cols = splitLine(line).map(c => String(c || '').trim());
    if(!cols.length) continue;

    let name = (cols[idxName] || cols[0] || '').trim();
    if(!name) continue;

    let brand = idxBrand >= 0 ? (cols[idxBrand] || '') : '';
    brand = String(brand || '').trim();

    let pvpRaw = idxPvp >= 0 ? cols[idxPvp] : '';

    // Si el PVP no está donde debería, buscar el último valor numérico de la línea.
    if(!pvpRaw || !String(pvpRaw).match(/[0-9]/)){
      for(let i=cols.length-1; i>=0; i--){
        if(String(cols[i]).match(/^[€\s]*[0-9]+(?:[.,][0-9]+)?\s*€?$/)){
          pvpRaw = cols[i];
          break;
        }
      }
    }

    let pvp = numero(pvpRaw);
    if(!Number.isFinite(pvp)) pvp = 0;

    rows.push({
      name,
      brand,
      pvp,
      raw: cols
    });
  }

  // Dejar orden estable por nombre, como venía haciendo el proyecto.
  return rows
    .filter(p => p.name)
    .sort((a,b)=>a.name.localeCompare(b.name,'es'));
}

// Mantener compatibilidad: cualquier llamada antigua a parseCSV usa el parser nuevo.
parseCSV = parseCSVRobusto175;

function extraTagsCSV175(p){
  const n = normaliza((p && p.name) || '');
  const tags = [];

  const add = (...xs) => xs.forEach(x => { if(x) tags.push(x); });

  // Nuevos productos / genéricos de tienda
  if(n.includes('rack')){
    add('rack','rack pared','armario rack','mural','pared','red','cableado','comunicaciones','infraestructura');
  }
  if(n.includes('abe') || n.includes('barrera')){
    add('barrera','barrera exterior','perimetral','proteccion perimetral','protección perimetral','intrusion','intrusión','exterior');
  }

  // Red / PoE
  if(n.includes('sw1008') || n.includes('vdms105') || n.includes('vdms108') || (n.includes('switch') && n.includes('poe'))){
    add('red','poe','switch','switch poe','ethernet','lan','camaras ip','cámaras ip','videovigilancia');
    if(n.includes('1008') || n.includes('108')) add('8 puertos','switch poe 8','8p');
    if(n.includes('105')) add('5 puertos','switch poe 5','5p');
  }
  if(n.includes('inj-poe') || n.includes('injector') || n.includes('inyector')){
    add('red','poe','inyector','inyector poe','injector poe','alimentacion poe','alimentación poe','ethernet','lan');
  }

  // Almacenamiento
  if(/^hd\d+tb/.test(n) || n.includes('disco') || n.includes('hdd')){
    add('almacenamiento','disco','disco duro','hdd','grabacion','grabación','nvr','cctv','videovigilancia');
  }
  if(n.includes('hs-tf') || n.includes('microsd') || n.includes('micro sd') || n.includes('tarjeta sd')){
    add('almacenamiento','tarjeta sd','micro sd','microsd','memoria','grabacion','grabación','camara','cámara');
  }

  // Alimentación / baterías
  if(n.includes('battery') || n.includes('batt') || n.includes('bateria') || n.includes('batería')){
    add('bateria','batería','battery','pila','alimentacion','alimentación','respaldo','backup');
  }
  if(n.includes('dc12') || n.includes('dc1224') || n.includes('psu') || n.includes('fuente')){
    add('fuente','alimentacion','alimentación','psu','12v','24v','baja tension','baja tensión');
  }

  // Mecanismos / automatización
  if(n.includes('solobutton') || n.includes('centerbutton') || n.includes('sidebutton')){
    add('confort','automatizacion','automatización','mecanismo','lightswitch','lightcore','interruptor','tecla','panel tactil','panel táctil');
  }
  if(n.includes('solocover') || n.includes('centercover') || n.includes('sidecover')){
    add('confort','automatizacion','automatización','mecanismo','outletcore','outlet','enchufe','tapa','cover','embellecedor');
  }

  return tags.join(' ');
}

function prepararIndiceBusqueda175(){
  productos.forEach((p)=>{
    let d = {desc:'', family:'', official:''};
    try{ d = descripcionProducto(p) || d; }catch(e){}
    p._desc = d.desc || '';
    p._family = d.family || '';
    p._official = d.official || '';
    p._search175 = normaliza([
      p.name,
      p.brand,
      p._desc,
      p._family,
      p._official,
      extraTagsCSV175(p)
    ].join(' '));
  });
}

async function cargarCatalogo(){
  let origen = 'externo';
  try{
    const r = await fetch(`${CSV_URL}?v=${Date.now()}`, {cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const txt = await r.text();
    productos = parseCSVRobusto175(txt);
    if(!productos.length) throw new Error('CSV vacío o columnas no reconocidas');
  }catch(e){
    // CSV externo obligatorio. El interno ya no debe tapar errores ni ocultar cambios nuevos.
    productos = [];
    origen = 'error';
    const msg = 'No se pudo cargar catalogo_ajax.csv. Ejecuta con INICIAR_WINDOWS/INICIAR_MAC_LINUX o súbelo junto al index.html.';
    const prev = $('#previewProducto');
    if(prev) prev.textContent = msg;
    console.error('Error cargando catálogo externo:', e);
    cargarSelect();
    renderRecientes();
    pintarResultados('');
    return;
  }

  prepararIndiceBusqueda175();

  const prev = $('#previewProducto');
  if(prev){
    prev.textContent = `${productos.length} productos cargados desde catalogo_ajax.csv.`;
  }

  cargarSelect();
  renderRecientes();
  pintarResultados('');
}

const descripcionProductoAnterior_175 = descripcionProducto;
descripcionProducto = function(p){
  const n = normaliza((p && p.name) || '');

  // StreetSiren: solo DoubleDeck / Custom / Brandplate son personalizables.
  if(n.includes('streetsiren')){
    if(n.includes('doubledeck') || n.includes('custom') || n.includes('brandplate')){
      return {icon:'🔔', desc:'Sirena inalámbrica con soporte para panel frontal personalizable', family:'Sirenas', official:'StreetSiren personalizable'};
    }
    return {icon:'🔔', desc:'Sirena inalámbrica para interiores y exteriores', family:'Sirenas', official:'StreetSiren Jeweller'};
  }

  // Productos nuevos y accesorios añadidos por CSV.
  if(n.includes('rack')){
    return {icon:'🗄️', desc:'Rack mural para instalación de red y comunicaciones', family:'Infraestructura', official:'Rack pared'};
  }
  if(n.includes('sw1008') || n.includes('vdms105') || n.includes('vdms108') || (n.includes('switch') && n.includes('poe'))){
    const puertos = n.includes('1008') || n.includes('108') ? '8' : (n.includes('105') ? '5' : '');
    return {icon:'🌐', desc:`Switch PoE${puertos ? ' de ' + puertos + ' puertos' : ''} para red y cámaras IP`, family:'Red / PoE', official:'Switch PoE'};
  }
  if(n.includes('inj-poe') || n.includes('injector') || n.includes('inyector')){
    return {icon:'⚡', desc:'Inyector PoE para alimentación por cable Ethernet', family:'Red / PoE', official:'Inyector PoE'};
  }
  if(/^hd\d+tb/.test(n)){
    const cap = ((p.name||'').match(/HD(\d+)TB/i)||[])[1];
    return {icon:'💾', desc:`Disco duro${cap ? ' ' + cap + ' TB' : ''} para grabación en NVR`, family:'Almacenamiento', official:'Disco duro'};
  }
  if(n.includes('hs-tf') || n.includes('microsd') || n.includes('micro sd')){
    const cap = ((p.name||'').match(/(32|64|128|256|512)G/i)||[])[1];
    return {icon:'💾', desc:`Tarjeta microSD${cap ? ' ' + cap + ' GB' : ''} para grabación`, family:'Almacenamiento', official:'Tarjeta microSD'};
  }
  if(n.includes('abe') || n.includes('barrera')){
    return {icon:'🛡️', desc:'Barrera de protección perimetral', family:'Protección contra intrusiones', official:'Barrera perimetral'};
  }

  return descripcionProductoAnterior_175(p);
};

const scoreProductoAnterior_175 = scoreProducto;
scoreProducto = function(p, term){
  const q = normaliza(term).trim();
  if(!q) return 0;

  const n = normaliza((p && p.name) || '');
  const b = normaliza((p && p.brand) || '');
  const search = p._search175 || normaliza([p.name, p.brand, extraTagsCSV175(p)].join(' '));
  const parts = q.split(/\s+/).filter(Boolean);

  // CO: evitar falsos positivos como CenterCover, SoloCover, etc.
  if(q === 'co' || q === 'monoxido' || q === 'monóxido' || q.includes('monoxido') || q.includes('monóxido')){
    return (n.includes('fireprotectplus') || n.includes('-c-') || n.includes('-hc-') || n.includes('-hsc-')) ? 30000 : 0;
  }

  let score = 0;

  // CSV manda siempre: referencia/nombre nunca queda oculto.
  if(n === q) score += 50000;
  if(n.startsWith(q)) score += 35000;
  if(n.includes(q)) score += 26000;
  if(b.includes(q)) score += 1000;

  // Palabras separadas.
  for(const part of parts){
    if(!part) continue;
    if(n.split(/[^a-z0-9]+/).includes(part)) score += 12000;
    else if(n.includes(part)) score += 8000;
    if(search.includes(part)) score += 1500;
  }

  if(search.includes(q)) score += 5000;

  // Mantener el motor anterior, pero que no pueda cargarse el fallback del CSV.
  try{
    score += Math.max(0, scoreProductoAnterior_175(p, q));
  }catch(e){}

  return score;
};

buscar = function(term){
  const q = normaliza(term).trim();
  if(!q) return [];
  const arr = productos
    .map((p,i)=>({p,i,score:scoreProducto(p,q), n:normaliza(p.name)}))
    .filter(x=>x.score>0)
    .sort((a,b)=>{
      const aExact = a.n === q ? 0 : (a.n.startsWith(q) ? 1 : (a.n.includes(q) ? 2 : 3));
      const bExact = b.n === q ? 0 : (b.n.startsWith(q) ? 1 : (b.n.includes(q) ? 2 : 3));
      return aExact-bExact || b.score-a.score || a.p.name.localeCompare(b.p.name,'es');
    });
  return arr.slice(0, 220);
};

buscarCatalogo = function(term=''){
  const q = String(term||'').trim();
  if(!q) return productos.map((p,i)=>({p,i,score:1})).sort((a,b)=>a.p.name.localeCompare(b.p.name,'es'));
  return buscar(q);
};

try{
  const setVersion = ()=>{
    document.querySelectorAll('.creator').forEach(el=>{
      el.textContent = el.textContent.replace(/v\d+\.\d+(?:\.\d+)?(?:\.\d+)?\s*PRO/g, APP_VERSION_175);
    });
  };
  document.addEventListener('DOMContentLoaded', setVersion);
}catch(e){}


/* =====================================================
   MOTOR PRO v1.8.1 - Normalizador técnico real
   - CSV manda siempre: referencia/nombre aparecen aunque no haya ficha.
   - DUMMY = carcasa vacía, con icono propio.
   - Bracket/Holder/Mount = accesorios de instalación, no armarios.
   - Covers/Frames/Buttons/Core clasificados como mecanismos.
   ===================================================== */
const APP_VERSION_181 = 'v1.8.1 PRO';
const descripcionProductoAnterior_181 = descripcionProducto;
const scoreProductoAnterior_181 = scoreProducto;

function ref181(p){ return String((p && p.name) || '').trim(); }
function n181(p){ return normaliza(ref181(p)); }
function has181(n, ...xs){ return xs.some(x => n.includes(normaliza(x))); }
function cap181(s){ return String(s||'').replace(/^AJ-/i,'').replace(/-DUMMY$/i,'').replace(/-/g,' '); }
function modelDummy181(n, original){
  if(n.includes('combiprotect')) return 'CombiProtect';
  if(n.includes('motioncamoutdoor')) return 'MotionCam Outdoor';
  if(n.includes('motioncam')) return 'MotionCam';
  if(n.includes('motionprotectplus')) return 'MotionProtect Plus';
  if(n.includes('motionprotect')) return 'MotionProtect';
  if(n.includes('curtainprotect')) return 'MotionProtect Curtain';
  if(n.includes('dualcurtain')) return 'DualCurtain Outdoor';
  if(n.includes('outdoorprotect')) return 'MotionProtect Outdoor';
  if(n.includes('doorprotectplus')) return 'DoorProtect Plus';
  if(n.includes('doorprotect')) return 'DoorProtect';
  if(n.includes('glassprotect')) return 'GlassProtect';
  if(n.includes('fireprotectplus')) return 'FireProtect Plus';
  if(n.includes('fireprotect')) return 'FireProtect';
  if(n.includes('homesiren')) return 'HomeSiren';
  if(n.includes('streetsirencustom')) return 'StreetSiren Custom';
  if(n.includes('streetsiren')) return 'StreetSiren';
  if(n.includes('keypadcombi')) return 'KeyPad Combi';
  if(n.includes('keypadplus')) return 'KeyPad Plus';
  if(n.includes('keypad')) return 'KeyPad';
  if(n.includes('spacecontrol')) return 'SpaceControl';
  if(n.includes('hub2plus')) return 'Hub 2 Plus';
  if(n.includes('hub2')) return 'Hub 2';
  if(n.includes('hub')) return 'Hub';
  return cap181(original);
}
function tipoDummy181(n){
  if(has181(n,'siren')) return 'sirena';
  if(has181(n,'keypad')) return 'teclado';
  if(has181(n,'hub')) return 'hub';
  if(has181(n,'fireprotect')) return 'detector de incendio';
  if(has181(n,'doorprotect')) return 'detector de apertura';
  if(has181(n,'glassprotect')) return 'detector de rotura de cristal';
  if(has181(n,'combiprotect')) return 'detector combinado de movimiento y rotura de cristal';
  if(has181(n,'motioncam')) return 'detector de movimiento con verificación fotográfica';
  if(has181(n,'motion','curtain','outdoorprotect')) return 'detector de movimiento';
  if(has181(n,'spacecontrol')) return 'mando';
  return 'dispositivo AJAX';
}
function meta181(p){
  const raw = ref181(p); const n = normaliza(raw);
  if(!raw) return null;

  // DUMMY siempre es carcasa/maqueta, nunca producto funcional.
  if(n.includes('dummy')){
    const modelo = modelDummy181(n, raw);
    const tipo = tipoDummy181(n);
    return {
      icon:'📦', family:'Accesorios', sub:'Carcasas vacías', official:modelo + ' Dummy',
      desc:`Carcasa vacía para ${modelo}. Maqueta sin electrónica ni sensores, pensada para demostración, formación o efecto disuasorio.`,
      tags:['dummy','carcasa','carcasa vacia','carcasa vacía','maqueta','sin electronica','sin electrónica',tipo,modelo]
    };
  }

  // Brackets / soportes de instalación. Nunca armarios rack.
  if(has181(n,'bracket')){
    let para = 'dispositivo AJAX';
    if(has181(n,'bracketdp','magnetdp')) para = 'DoorProtect';
    else if(has181(n,'bracketfp')) para = 'FireProtect';
    else if(has181(n,'brackeths')) para = 'HomeSiren';
    else if(has181(n,'brackethub')) para = 'Hub';
    else if(has181(n,'bracketkp')) para = 'KeyPad';
    else if(has181(n,'bracketmc')) para = 'MotionCam';
    else if(has181(n,'bracketmco','bracketmpo')) para = 'MotionProtect Outdoor / MotionCam Outdoor';
    else if(has181(n,'bracketmp')) para = 'MotionProtect';
    else if(has181(n,'bracketss')) para = 'StreetSiren';
    return {icon:'🛠️', family:'Accesorios', sub:'Accesorios de instalación', official:'Soporte de montaje', desc:`Soporte de montaje para ${para}.`, tags:['bracket','soporte','soporte montaje','instalacion','instalación',para]};
  }
  if(has181(n,'holder')){
    if(has181(n,'dinholder')) return {icon:'🛠️', family:'Accesorios', sub:'Accesorios de instalación', official:'DIN Holder', desc:'Soporte DIN para instalar Relay o WallSwitch en carril DIN.', tags:['holder','soporte','din','carril din','relay','wallswitch']};
    return {icon:'🛠️', family:'Accesorios', sub:'Accesorios de instalación', official:'Holder', desc:'Soporte de instalación para fijación de accesorios AJAX.', tags:['holder','soporte','instalacion','instalación']};
  }
  if(has181(n,'mountcam')){
    const modelo = n.includes('a1')?'A1':n.includes('a2')?'A2':n.includes('b1')?'B1':n.includes('b2')?'B2':'';
    return {icon:'🛠️', family:'Accesorios', sub:'Soportes para cámaras', official:'MountCam '+modelo, desc:`Soporte de pared ${modelo ? modelo + ' ' : ''}para cámaras IP cableadas AJAX.`, tags:['mountcam','soporte camara','soporte cámara','pared','cctv','camera','camara','cámara',modelo]};
  }
  if(has181(n,'junctionbox')) return {icon:'🧰', family:'Accesorios', sub:'Cajas de conexiones', official:'JunctionBox', desc:'Caja de conexiones para instalación de cámaras IP cableadas AJAX.', tags:['junctionbox','caja conexiones','caja montaje','camara','cámara','cctv']};
  if(has181(n,'surfacebox')) return {icon:'🧰', family:'Accesorios', sub:'Cajas de superficie', official:'SurfaceBox', desc:'Caja de montaje en superficie para mecanismos LightSwitch u Outlet.', tags:['surfacebox','caja superficie','caja montaje','mecanismo','lightswitch','outlet']};
  if(has181(n,'hood')) return {icon:'🛡️', family:'Accesorios', sub:'Accesorios de instalación', official:'Hood', desc:'Visera protectora para detectores de exterior AJAX.', tags:['hood','visera','protector','exterior','motionprotect outdoor','motioncam outdoor']};

  // Tapas, marcos y mecanismos. No pánico.
  if(has181(n,'solocover','centercover','sidecover','coverplate')){
    let destino = 'OutletCore';
    if(has181(n,'lan')) destino = 'Outlet LAN';
    if(has181(n,'smart')) destino = 'Outlet inteligente';
    if(has181(n,'cp','coverplate')) destino = 'CoverPlate / caja de montaje';
    return {icon:'🧩', family:'Confort y automatización', sub:'Tapas y embellecedores', official:'Tapa', desc:`Tapa/embellecedor para ${destino}.`, tags:['cover','tapa','embellecedor','mecanismo','outletcore','outlet','enchufe',destino]};
  }
  if(has181(n,'solobutton','centerbutton','sidebutton')){
    let tipo = has181(n,'dimmer') ? 'dimmer' : has181(n,'2g') ? '2 bandas' : has181(n,'1g2w') ? '1 banda / 2 vías' : 'LightSwitch';
    return {icon:'💡', family:'Confort y automatización', sub:'Mecanismos LightSwitch', official:'Tecla LightSwitch', desc:`Botón/tecla frontal para mecanismo LightSwitch ${tipo}.`, tags:['button','boton','botón','tecla','mecanismo','lightswitch','interruptor','domotica','domótica',tipo]};
  }
  if(/^aj-frame/i.test(raw) || has181(n,'frame-')){
    const plazas = (raw.match(/FRAME-(\d)/i)||[])[1] || '';
    return {icon:'🪟', family:'Confort y automatización', sub:'Marcos', official:'Frame', desc:`Marco${plazas ? ' de ' + plazas + ' elementos' : ''} para mecanismos LightSwitch / Outlet.`, tags:['frame','marco','mecanismo','lightswitch','outlet','enchufe',plazas]};
  }
  if(has181(n,'lightcore')){
    let tipo = has181(n,'dimmer')?'dimmer':has181(n,'cross')?'cruce':has181(n,'2g2w')?'2 bandas y 2 vías':has181(n,'2g')?'2 bandas':has181(n,'2w')?'2 vías':'1 banda';
    return {icon:'💡', family:'Confort y automatización', sub:'Módulos LightSwitch', official:'LightCore', desc:`Módulo LightSwitch ${tipo} para interruptor inteligente táctil.`, tags:['core','modulo','módulo','lightswitch','interruptor','luz','domotica','domótica',tipo]};
  }
  if(has181(n,'outletcore')){
    let tipo = has181(n,'lan')?'Ethernet/LAN':has181(n,'smart')?'inteligente con monitor de consumo':'básico';
    return {icon:'🔌', family:'Confort y automatización', sub:'Módulos Outlet', official:'OutletCore', desc:`Módulo Outlet ${tipo} para base de enchufe AJAX.`, tags:['core','modulo','módulo','outlet','enchufe','base enchufe','toma corriente','mecanismo',tipo]};
  }

  // KeyPadCombi especial.
  if(has181(n,'keypadcombi')) return {icon:'⌨️', family:'Teclados', sub:'Teclados con sirena', official:'KeyPad Combi', desc:'Teclado inalámbrico con sirena integrada, compatible con Pass, Tag, smartphones y códigos.', tags:['keypad','teclado','sirena','teclado con sirena','pass','tag','codigo','código']};

  // Infraestructura / Red / Almacenamiento / Alimentación.
  if(has181(n,'rack-wall') || /^rack/.test(n)) return {icon:'🗄️', family:'Infraestructura', sub:'Armarios Rack', official:'Rack mural', desc:'Armario rack mural para instalación de equipos de comunicaciones, red y videovigilancia.', tags:['rack','rack mural','armario','pared','mural','19','comunicaciones','nvr','switch','red']};
  if(has181(n,'sw1008poe','vdms108gp')) return {icon:'🌐', family:'Red / PoE', sub:'Switches PoE', official:'Switch PoE 8 puertos', desc:'Switch PoE de 8 puertos para alimentación y conexión de cámaras IP y equipos de red.', tags:['switch','switch poe','poe','8 puertos','ethernet','red','cctv','camara ip','cámara ip']};
  if(has181(n,'vdms105gp','sw1005poe')) return {icon:'🌐', family:'Red / PoE', sub:'Switches PoE', official:'Switch PoE 5 puertos', desc:'Switch PoE de 5 puertos para alimentación y conexión de cámaras IP y equipos de red.', tags:['switch','switch poe','poe','5 puertos','ethernet','red','cctv','camara ip','cámara ip']};
  if(has181(n,'inj-poe','injector','inyector')) return {icon:'⚡', family:'Red / PoE', sub:'Inyectores PoE', official:'Inyector PoE', desc:'Inyector PoE para alimentar dispositivos de red mediante cable Ethernet.', tags:['inyector','injector','poe','alimentacion poe','alimentación poe','ethernet','red']};
  if(/^hd\d+tb/.test(n) || has181(n,'hdd','disco')){ const cap=(raw.match(/HD(\d+)TB/i)||[])[1]; return {icon:'💾', family:'Almacenamiento', sub:'Discos duros', official:'Disco duro', desc:`Disco duro${cap?' '+cap+' TB':''} para grabación en NVR y sistemas de videovigilancia.`, tags:['disco','disco duro','hdd','grabacion','grabación','nvr','almacenamiento',cap]}; }
  if(has181(n,'hs-tf','microsd','micro-sd','tarjeta-sd')){ const cap=(raw.match(/(32|64|128|256|512)G/i)||[])[1]; return {icon:'💾', family:'Almacenamiento', sub:'Tarjetas microSD', official:'Tarjeta microSD', desc:`Tarjeta microSD${cap?' '+cap+' GB':''} para almacenamiento y grabación.`, tags:['sd','micro sd','microsd','tarjeta','memoria','grabacion','grabación',cap]}; }
  if(has181(n,'battery','batt') || /^aj-battery/.test(n)) return {icon:'🔋', family:'Alimentación', sub:'Baterías', official:'Batería', desc:'Batería o pack de alimentación para dispositivos AJAX.', tags:['battery','bateria','batería','pila','alimentacion','alimentación']};
  if(has181(n,'psu','dc12v','dc1224v','dc6v','ac220v')) return {icon:'⚡', family:'Alimentación', sub:'Fuentes de alimentación', official:'Fuente de alimentación', desc:'Fuente o módulo de alimentación para dispositivos AJAX.', tags:['psu','fuente','alimentacion','alimentación','12v','24v','6v','baja tension','baja tensión']};

  return null;
}

function textoBusqueda181(p){
  const m = meta181(p);
  const prev = (()=>{ try{ const d = descripcionProductoAnterior_181(p); return [d.desc,d.family,d.official].join(' '); }catch(e){ return ''; }})();
  return normaliza([ref181(p), p && p.brand, m && m.family, m && m.sub, m && m.desc, m && m.official, m && (m.tags||[]).join(' '), prev].join(' '));
}

descripcionProducto = function(p){
  const m = meta181(p);
  if(m) return {icon:m.icon, desc:m.desc, family:m.sub ? `${m.family} · ${m.sub}` : m.family, official:m.official};
  return descripcionProductoAnterior_181(p);
};

scoreProducto = function(p, term){
  const q = normaliza(term).trim(); if(!q) return 0;
  const n = n181(p), brand = normaliza((p && p.brand)||'');
  const search = textoBusqueda181(p);
  const parts = q.split(/\s+/).filter(Boolean);
  let score = 0;

  // CSV manda siempre.
  if(n === q) score += 60000;
  if(n.startsWith(q)) score += 42000;
  if(n.includes(q)) score += 32000;
  if(brand.includes(q)) score += 1000;
  for(const part of parts){
    if(n.split(/[^a-z0-9]+/).includes(part)) score += 16000;
    else if(n.includes(part)) score += 10000;
    if(search.includes(part)) score += 2500;
  }
  if(search.includes(q)) score += 9000;

  // Sinónimos técnicos fuertes.
  if(['carcasa','carcasa vacia','carcasa vacía','maqueta','dummy'].includes(q)) score += n.includes('dummy') ? 50000 : 0;
  if(['tapa','embellecedor','cover'].includes(q)) score += has181(n,'cover','coverplate') ? 45000 : 0;
  if(['marco','frame'].includes(q)) score += has181(n,'frame') ? 45000 : 0;
  if(['soporte','bracket','holder','mount'].includes(q)) score += has181(n,'bracket','holder','mountcam','hood') ? 45000 : 0;
  if(q.includes('soporte camara') || q.includes('soporte cámara')) score += has181(n,'mountcam') ? 50000 : 0;
  if(q.includes('caja conexiones')) score += has181(n,'junctionbox') ? 50000 : 0;
  if(q.includes('rack') || q.includes('armario') || q.includes('mural')) score += has181(n,'rack') ? 50000 : 0;
  if(q.includes('switch poe') || q==='poe') score += has181(n,'sw1008poe','vdms108gp','vdms105gp','inj-poe') ? 30000 : 0;
  if(q.includes('inyector')) score += has181(n,'inj-poe','injector') ? 50000 : 0;
  if(q.includes('keypad') || q.includes('teclado') || q.includes('sirena')) score += has181(n,'keypadcombi') ? 12000 : 0;

  try{ score += Math.max(0, scoreProductoAnterior_181(p, q)); }catch(e){}
  return score;
};

buscar = function(term){
  const q = normaliza(term).trim(); if(!q) return [];
  return productos
    .map((p,i)=>({p,i,score:scoreProducto(p,q), n:n181(p)}))
    .filter(x=>x.score>0)
    .sort((a,b)=>{
      const ae = a.n===q?0:(a.n.startsWith(q)?1:(a.n.includes(q)?2:3));
      const be = b.n===q?0:(b.n.startsWith(q)?1:(b.n.includes(q)?2:3));
      return ae-be || b.score-a.score || a.p.name.localeCompare(b.p.name,'es');
    })
    .slice(0,260);
};

buscarCatalogo = function(term=''){
  const q = String(term||'').trim();
  if(!q) return productos.map((p,i)=>({p,i,score:1})).sort((a,b)=>a.p.name.localeCompare(b.p.name,'es'));
  return buscar(q);
};

try{
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.creator').forEach(el=>{
      el.textContent = el.textContent.replace(/v\d+\.\d+(?:\.\d+)?(?:\.\d+)?\s*PRO/g, APP_VERSION_181);
    });
  });
}catch(e){}

/* =====================================================
   Hiper AJAX v1.8.2 PRO - Motor de catálogo estable
   ===================================================== */
const APP_VERSION_182 = 'v1.8.2 PRO';
function ref182(p){ return String((p && p.name) || '').trim(); }
function n182(p){ return normaliza(ref182(p)); }
function has182(n,...xs){ return xs.some(x => n.includes(normaliza(x))); }
function dummyTarget182(n){
  if(has182(n,'combiprotect')) return 'detector combinado de movimiento y rotura de cristal CombiProtect';
  if(has182(n,'motioncamoutdoor')) return 'detector exterior MotionCam Outdoor';
  if(has182(n,'motioncam')) return 'detector de movimiento con verificación fotográfica MotionCam';
  if(has182(n,'motionprotectplus')) return 'detector de movimiento MotionProtect Plus';
  if(has182(n,'motionprotect')) return 'detector de movimiento MotionProtect';
  if(has182(n,'curtain')) return 'detector de movimiento tipo cortina';
  if(has182(n,'doorprotectplus')) return 'detector de apertura DoorProtect Plus';
  if(has182(n,'doorprotect')) return 'detector de apertura DoorProtect';
  if(has182(n,'glassprotect')) return 'detector de rotura de cristal GlassProtect';
  if(has182(n,'fireprotect')) return 'detector de incendio FireProtect';
  if(has182(n,'homesiren')) return 'sirena interior HomeSiren';
  if(has182(n,'streetsiren')) return 'sirena exterior StreetSiren';
  if(has182(n,'keypadcombi')) return 'teclado con sirena KeyPad Combi';
  if(has182(n,'keypad')) return 'teclado KeyPad';
  if(has182(n,'hub')) return 'central Hub';
  return 'dispositivo AJAX';
}
function meta182(p){
  const raw = ref182(p), n = normaliza(raw);
  let prev = null; try{ if(typeof meta181 === 'function') prev = meta181(p); }catch(e){}
  if(has182(n,'dummy')){ const target = dummyTarget182(n); return {icon:'📦',family:'Accesorios de instalación',sub:'Carcasas vacías / maquetas',official:'Carcasa vacía',desc:`Carcasa vacía para ${target}. Producto sin electrónica, sin sensores y sin comunicación; útil para demostración, reposición de carcasa o efecto disuasorio.`,tags:['dummy','carcasa','carcasa vacia','carcasa vacía','maqueta','sin electrónica','accesorio','instalación',target]}; }
  if(has182(n,'dinholder')) return {icon:'🛠️',family:'Accesorios de instalación',sub:'Soportes DIN',official:'DIN Holder',desc:'Soporte DIN para montaje de Relay o WallSwitch en carril DIN.',tags:['din holder','soporte din','carril din','relay','wallswitch','soporte']};
  if(has182(n,'holder') && !has182(n,'coverholder')) return {icon:'🛠️',family:'Accesorios de instalación',sub:'Soportes',official:'Holder',desc:'Soporte de instalación para fijar accesorios o botones AJAX en superficie.',tags:['holder','soporte','fijación','instalación']};
  if(has182(n,'bracket')) return {icon:'🛠️',family:'Accesorios de instalación',sub:'Soportes de montaje',official:'SmartBracket / Bracket',desc:'Soporte de montaje para instalación de dispositivos AJAX.',tags:['bracket','smartbracket','soporte','soporte montaje','instalación','montaje','accesorio']};
  if(has182(n,'mountcam')){ const modelo=(raw.match(/MOUNTCAM-([AB]\d)/i)||[])[1]||''; return {icon:'🛠️',family:'Accesorios de instalación',sub:'Soportes para cámaras',official:'MountCam',desc:`Soporte de pared${modelo?' '+modelo:''} para cámaras IP cableadas AJAX.`,tags:['mountcam','soporte camara','soporte cámara','pared','camara','cámara','cctv',modelo]}; }
  if(has182(n,'junctionbox')) return {icon:'🧰',family:'Accesorios de instalación',sub:'Cajas de conexiones',official:'JunctionBox',desc:'Caja de conexiones para instalación de cámaras IP cableadas AJAX.',tags:['junctionbox','caja conexiones','caja montaje','camara','cámara','cctv']};
  if(has182(n,'ip66')) return {icon:'🧰',family:'Accesorios de instalación',sub:'Cajas estancas IP66',official:'Caja IP66',desc:'Caja estanca IP66 para protección de conexiones y equipos en instalaciones de exterior.',tags:['ip66','caja estanca','exterior','protección','agua','polvo']};
  if(has182(n,'solocover','centercover','sidecover','coverplate')){ let destino='OutletCore'; if(has182(n,'lan')) destino='Outlet LAN'; if(has182(n,'smart')) destino='Outlet inteligente'; if(has182(n,'coverplate','cp')) destino='caja de montaje / CoverPlate'; return {icon:'🧩',family:'Confort y automatización',sub:'Tapas y embellecedores',official:'Tapa',desc:`Tapa / embellecedor para ${destino}.`,tags:['cover','tapa','embellecedor','mecanismo','outletcore','outlet','enchufe','base enchufe',destino]}; }
  if(/^aj-frame/i.test(raw) || has182(n,'frame-')){ const plazas=(raw.match(/FRAME-(\d)/i)||[])[1]||''; return {icon:'🪟',family:'Confort y automatización',sub:'Marcos',official:'Frame',desc:plazas?`Marco de ${plazas} elementos para mecanismos LightSwitch / Outlet.`:'Marco para mecanismos LightSwitch / Outlet.',tags:['frame','marco','embellecedor','mecanismo','lightswitch','outlet','enchufe',plazas]}; }
  if(has182(n,'solobutton','centerbutton','sidebutton')){ let tipo=has182(n,'dimmer')?'dimmer':has182(n,'2g')?'2 bandas':has182(n,'1g2w')?'1 banda / 2 vías':'LightSwitch'; return {icon:'💡',family:'Confort y automatización',sub:'Mecanismos LightSwitch',official:'Tecla LightSwitch',desc:`Botón / tecla frontal para mecanismo LightSwitch ${tipo}.`,tags:['button','botón','tecla','mecanismo','lightswitch','interruptor','luz','domótica',tipo]}; }
  if(has182(n,'lightcore')){ let tipo=has182(n,'dimmer')?'dimmer':has182(n,'cross')?'cruce':has182(n,'2g2w')?'2 bandas y 2 vías':has182(n,'2g')?'2 bandas':has182(n,'2w')?'2 vías':'1 banda'; return {icon:'💡',family:'Confort y automatización',sub:'Módulos LightSwitch',official:'LightCore',desc:`Módulo LightSwitch ${tipo} para interruptor inteligente táctil.`,tags:['core','módulo','lightswitch','interruptor','luz','domótica',tipo]}; }
  if(has182(n,'outletcore')){ let tipo=has182(n,'lan')?'Ethernet/LAN':has182(n,'smart')?'inteligente con monitor de consumo':'básico'; return {icon:'🔌',family:'Confort y automatización',sub:'Módulos Outlet',official:'OutletCore',desc:`Módulo Outlet ${tipo} para base de enchufe AJAX.`,tags:['core','módulo','outlet','enchufe','base enchufe','toma corriente','mecanismo',tipo]}; }
  if(has182(n,'socket')) return {icon:'🔌',family:'Confort y automatización',sub:'Enchufes inteligentes',official:'Socket',desc:'Enchufe inteligente AJAX con monitor de consumo eléctrico.',tags:['socket','enchufe','enchufe inteligente','toma corriente','schuko','consumo','domótica']};
  if(has182(n,'outlet')) return {icon:'🔌',family:'Confort y automatización',sub:'Bases de enchufe',official:'Outlet',desc:'Base de enchufe AJAX para mecanismos de pared.',tags:['outlet','enchufe','base enchufe','toma corriente','mecanismo','pared']};
  if(has182(n,'wallswitch')) return {icon:'⚡',family:'Confort y automatización',sub:'Relés',official:'WallSwitch',desc:'Relé de potencia para controlar alimentación de 110/230 V en remoto.',tags:['wallswitch','relé','relé potencia','automatización','110v','230v']};
  if(has182(n,'relay')) return {icon:'⚡',family:'Confort y automatización',sub:'Relés',official:'Relay',desc:'Relé inalámbrico de contacto seco para control remoto.',tags:['relay','relé','contacto seco','automatización']};
  if(has182(n,'keypadcombi')) return {icon:'⌨️',family:'Teclados',sub:'Teclados con sirena',official:'KeyPad Combi',desc:'Teclado inalámbrico con sirena integrada, compatible con Pass, Tag, smartphones y códigos.',tags:['keypad','teclado','sirena','teclado con sirena','pass','tag','código']};
  if(has182(n,'rack-wall') || /^rack/.test(n)) return {icon:'🗄️',family:'Infraestructura',sub:'Armarios Rack',official:'Rack mural',desc:'Armario rack mural para instalación de equipos de comunicaciones, red y videovigilancia.',tags:['rack','rack mural','armario','pared','mural','19','comunicaciones','nvr','switch','red']};
  if(has182(n,'sw1008poe','vdms108gp') || (/^sw.*poe/.test(n) && has182(n,'1008','108','8'))) return {icon:'🌐',family:'Red / PoE',sub:'Switches PoE',official:'Switch PoE 8 puertos',desc:'Switch PoE de 8 puertos para alimentación y conexión de cámaras IP y equipos de red.',tags:['switch','switch poe','poe','8 puertos','ethernet','red','cctv','cámara ip']};
  if(has182(n,'vdms105gp','sw1005poe') || (/^sw.*poe/.test(n) && has182(n,'1005','105','5'))) return {icon:'🌐',family:'Red / PoE',sub:'Switches PoE',official:'Switch PoE 5 puertos',desc:'Switch PoE de 5 puertos para alimentación y conexión de cámaras IP y equipos de red.',tags:['switch','switch poe','poe','5 puertos','ethernet','red','cctv','cámara ip']};
  if(has182(n,'inj-poe','injector','inyector')) return {icon:'⚡',family:'Red / PoE',sub:'Inyectores PoE',official:'Inyector PoE',desc:'Inyector PoE para alimentar dispositivos de red mediante cable Ethernet.',tags:['inyector','injector','poe','alimentación poe','ethernet','red']};
  if(/^hd\d+tb/.test(n) || has182(n,'hdd','disco')){ const cap=(raw.match(/HD(\d+)TB/i)||[])[1]; return {icon:'💾',family:'Almacenamiento',sub:'Discos duros',official:'Disco duro',desc:`Disco duro${cap?' '+cap+' TB':''} para grabación en NVR y sistemas de videovigilancia.`,tags:['disco','disco duro','hdd','grabación','nvr','almacenamiento',cap]}; }
  if(has182(n,'hs-tf','microsd','micro-sd','tarjeta-sd')){ const cap=(raw.match(/(32|64|128|256|512)G/i)||[])[1]; return {icon:'💾',family:'Almacenamiento',sub:'Tarjetas microSD',official:'Tarjeta microSD',desc:`Tarjeta microSD${cap?' '+cap+' GB':''} para almacenamiento y grabación.`,tags:['sd','micro sd','microsd','tarjeta','memoria','grabación',cap]}; }
  if(has182(n,'battery','batt') || /^aj-battery/.test(n)) return {icon:'🔋',family:'Alimentación',sub:'Baterías',official:'Batería',desc:'Batería o pack de alimentación para dispositivos AJAX.',tags:['battery','batería','pila','alimentación','backup','respaldo']};
  if(has182(n,'dc12v2a','dc12v','dc1224v','dc6v','psu','ac220v')) return {icon:'⚡',family:'Alimentación',sub:'Fuentes de alimentación',official:'Fuente de alimentación',desc:'Fuente o módulo de alimentación para dispositivos AJAX.',tags:['dc','dc12','dc12v2a','psu','fuente','alimentación','12v','24v','6v','baja tensión']};
  if(has182(n,'streetsiren') && !has182(n,'doubledeck','custom','brandplate')) return {icon:'🔊',family:'Sirenas',sub:'Sirenas exterior/interior',official:'StreetSiren',desc:'Sirena inalámbrica para interiores y exteriores.',tags:['sirena','streetsiren','alarma','exterior','interior','acústica']};
  return prev;
}
const descripcionProducto_PRE182 = descripcionProducto;
descripcionProducto = function(p){ const m = meta182(p); if(m) return {icon:m.icon,desc:m.desc,family:m.sub?`${m.family} · ${m.sub}`:m.family,official:m.official}; try{return descripcionProducto_PRE182(p);}catch(e){return {icon:'📦',desc:'Producto del catálogo',family:'Producto nuevo',official:ref182(p)};} };
function textoBusqueda182(p){ const m=meta182(p)||{}; let prev=''; try{const d=descripcionProducto_PRE182(p); prev=[d.desc,d.family,d.official].join(' ');}catch(e){} return normaliza([ref182(p),p&&p.brand,m.family,m.sub,m.desc,m.official,(m.tags||[]).join(' '),prev,p&&p._search175].join(' ')); }
const scoreProducto_PRE182 = scoreProducto;
scoreProducto = function(p, term){
  const q=normaliza(term).trim(); if(!q) return 0; const n=n182(p), search=textoBusqueda182(p); const parts=q.split(/\s+/).filter(Boolean); let score=0;
  if(n===q) score+=100000; if(n.startsWith(q)) score+=70000; if(n.includes(q)) score+=55000; for(const part of parts){ if(n.split(/[^a-z0-9]+/).includes(part)) score+=26000; else if(n.includes(part)) score+=18000; if(search.includes(part)) score+=5000; } if(search.includes(q)) score+=14000;
  const boost=(cond,val)=>{if(cond) score+=val;};
  boost(['enchufe','base enchufe','toma corriente','schuko','toma'].includes(q), has182(n,'socket','outlet','outletcore')?70000:0);
  boost(['carcasa','carcasa vacia','carcasa vacía','maqueta','dummy'].includes(q), has182(n,'dummy','case')?70000:0);
  boost(['tapa','embellecedor','cover'].includes(q), has182(n,'cover','coverplate')?65000:0);
  boost(['marco','frame'].includes(q), has182(n,'frame')?65000:0);
  boost(['soporte','bracket','holder','mount','montaje'].includes(q), has182(n,'bracket','holder','mountcam','hood')?65000:0);
  boost(q.includes('soporte camara') || q.includes('soporte cámara'), has182(n,'mountcam')?75000:0);
  boost(q.includes('caja') || q.includes('ip66'), has182(n,'junctionbox','surfacebox','ip66')?52000:0);
  boost(q.includes('rack') || q.includes('armario') || q.includes('mural'), has182(n,'rack')?70000:0);
  boost(q.includes('switch poe') || q==='poe', has182(n,'sw1008poe','vdms108gp','vdms105gp','inj-poe')?55000:0);
  boost(q.includes('inyector'), has182(n,'inj-poe','injector')?75000:0);
  boost(q.includes('fuente') || q.includes('alimentacion') || q.includes('alimentación') || q.includes('dc12'), has182(n,'dc12','dc1224','psu','ac220','dc6')?70000:0);
  boost(q.includes('bateria') || q.includes('batería') || q.includes('battery') || q.includes('pila'), has182(n,'battery','batt')?70000:0);
  boost(q.includes('teclado') || q.includes('keypad'), has182(n,'keypad')?55000:0);
  boost(q.includes('sirena'), has182(n,'siren','keypadcombi')?50000:0);
  try{score+=Math.max(0,scoreProducto_PRE182(p,q));}catch(e){} return score;
};
buscar = function(term){ const q=normaliza(term).trim(); if(!q) return []; return productos.map((p,i)=>({p,i,score:scoreProducto(p,q),n:n182(p)})).filter(x=>x.score>0).sort((a,b)=>{const ae=a.n===q?0:(a.n.startsWith(q)?1:(a.n.includes(q)?2:3)); const be=b.n===q?0:(b.n.startsWith(q)?1:(b.n.includes(q)?2:3)); return ae-be||b.score-a.score||a.p.name.localeCompare(b.p.name,'es');}).slice(0,260); };
buscarCatalogo = function(term=''){ const q=String(term||'').trim(); if(!q) return productos.map((p,i)=>({p,i,score:1})).sort((a,b)=>a.p.name.localeCompare(b.p.name,'es')); return buscar(q); };
let recientesSesion182 = [];
registrarReciente = function(nombre){ const name=String(nombre||'').trim(); if(!name) return; const idx=recientesSesion182.findIndex(x=>x.name===name); if(idx>=0) recientesSesion182[idx].count+=1; else recientesSesion182.unshift({name,count:1}); recientesSesion182=recientesSesion182.sort((a,b)=>b.count-a.count).slice(0,12); renderRecientes(); };
renderRecientes = function(){
  const wrap=document.querySelector('#recentes');
  if(!wrap) return;
  if(!recientesSesion182.length){ wrap.innerHTML=''; return; }
  wrap.innerHTML='<span class="recent-label">Atajos:</span>'+recientesSesion182.map(x=>`<button type="button" class="recent-chip" data-name="${escapeHtml(x.name)}">${escapeHtml(x.name)}${x.count>1?' ×'+x.count:''}</button>`).join('');
  wrap.querySelectorAll('.recent-chip').forEach(btn=>btn.addEventListener('click',()=>{
    const p=findProductoByQuery(btn.dataset.name);
    const qty=Number(document.querySelector('#cantidad')?.value)||1;
    if(p && addProductoObj(p,qty)){
      render();
      hxToastGlobal(`${p.name} añadido`,'ok');
      btn.classList.add('added-ok');
      const original=btn.textContent;
      btn.textContent='✓ Añadido';
      setTimeout(()=>{ btn.textContent=original; btn.classList.remove('added-ok'); },700);
    }else{
      hxToastGlobal('No se pudo añadir el producto.','error');
    }
  }));
};
const guardar_PRE182 = guardar;
guardar = function(){ if(!Array.isArray(lineas)||lineas.length===0){ alert('Añade al menos un producto antes de guardar el presupuesto.'); return; } return guardar_PRE182(); };
const pintarResultados_PRE182 = pintarResultados;
pintarResultados = function(term){ const r=pintarResultados_PRE182(term); const panel=document.querySelector('#resultados'); if(panel) panel.scrollTop=0; return r; };
const pintarCatalogPanel_PRE182 = (typeof pintarCatalogPanel==='function') ? pintarCatalogPanel : null;
if(pintarCatalogPanel_PRE182){ pintarCatalogPanel=function(term){ const r=pintarCatalogPanel_PRE182(term); const items=document.querySelector('#catalogItems'); if(items) items.scrollTop=0; const card=document.querySelector('#catalogModal .modal-card'); if(card) card.scrollTop=0; return r; }; }
document.addEventListener('DOMContentLoaded',()=>{ document.querySelectorAll('.creator').forEach(el=>{ el.textContent=`· Creado por David Corregidor · ${APP_VERSION_182}`; }); ['#btnCatalogo','#btnFamilias'].forEach(sel=>document.querySelector(sel)?.addEventListener('click',()=>setTimeout(()=>{ document.querySelectorAll('.modal-card,#catalogItems,#resultados').forEach(x=>{try{x.scrollTop=0;}catch(e){}}); },30))); });

/* =====================================================
   PATCH v1.8.3 PRO - Familias rápidas + índice sin tocar descripciones
   - NO sustituye descripciones existentes.
   - Solo mejora familias, etiquetas y velocidad de búsqueda.
   - Fuente DC / PSU / AC clasificado como Alimentación.
   ===================================================== */
const APP_VERSION_183 = 'v1.8.3 PRO';

function ref183(p){ return String((p && p.name) || '').trim(); }
function n183(p){ return normaliza(ref183(p)); }
function has183(txt,...keys){ return keys.some(k => txt.includes(normaliza(k))); }

function meta183(p){
  const raw = ref183(p);
  const n = n183(p);
  let m = null;
  try{ if(typeof meta182 === 'function') m = meta182(p); }catch(e){ m = null; }

  // Fuentes DC / PSU / AC: familia correcta sin cambiar la descripción visible.
  if(
    /(^|-)DC\d{1,2}V/i.test(raw) ||
    has183(n,'dc12v','dc1224v','dc6v','dc12v2a','psu','ac220v','fuente dc','12v psu')
  ){
    return Object.assign({}, m || {}, {
      icon:'⚡',
      family:'Alimentación',
      sub:'Fuentes de alimentación DC / PSU',
      official:(m && m.official) || 'Fuente de alimentación',
      tags:[...new Set([...(m && m.tags || []),'fuente','fuente dc','alimentación','alimentacion','dc','dc12','dc12v','dc12v2a','psu','12v','24v','6v','baja tensión','alimentador'])]
    });
  }

  // IP66: caja estanca / instalación exterior.
  if(has183(n,'ip66')){
    return Object.assign({}, m || {}, {
      icon:'🧰',
      family:'Accesorios de instalación',
      sub:'Cajas estancas IP66',
      official:(m && m.official) || 'Caja estanca IP66',
      tags:[...new Set([...(m && m.tags || []),'ip66','caja','caja estanca','exterior','instalación exterior','protección','agua','polvo'])]
    });
  }

  // Rack mural.
  if(has183(n,'rack-wall') || /^rack/.test(n)){
    return Object.assign({}, m || {}, {
      icon:'🗄️',
      family:'Infraestructura',
      sub:'Armarios Rack',
      official:(m && m.official) || 'Rack mural',
      tags:[...new Set([...(m && m.tags || []),'rack','rack mural','armario','pared','mural','19','comunicaciones','nvr','switch','red'])]
    });
  }

  // Switch PoE e inyector.
  if(has183(n,'poe') && (has183(n,'switch','sw1008','sw1005','vdms105','vdms108') || /^sw/.test(n))){
    return Object.assign({}, m || {}, {
      icon:'🌐',
      family:'Red / PoE',
      sub:'Switches PoE',
      official:(m && m.official) || 'Switch PoE',
      tags:[...new Set([...(m && m.tags || []),'switch','switch poe','poe','red','ethernet','cctv','cámaras ip','camara ip','8 puertos','5 puertos'])]
    });
  }
  if(has183(n,'inj-poe','injector','inyector')){
    return Object.assign({}, m || {}, {
      icon:'⚡',
      family:'Red / PoE',
      sub:'Inyectores PoE',
      official:(m && m.official) || 'Inyector PoE',
      tags:[...new Set([...(m && m.tags || []),'inyector','injector','poe','alimentación poe','alimentacion poe','ethernet','red'])]
    });
  }

  // Almacenamiento.
  if(/^hd\d+tb/.test(n) || has183(n,'hdd','disco duro')){
    return Object.assign({}, m || {}, {
      icon:'💾',
      family:'Almacenamiento',
      sub:'Discos duros',
      official:(m && m.official) || 'Disco duro',
      tags:[...new Set([...(m && m.tags || []),'disco','disco duro','hdd','hd','grabación','grabacion','nvr','almacenamiento'])]
    });
  }
  if(has183(n,'hs-tf','microsd','micro-sd','tarjeta-sd','tarjeta sd')){
    return Object.assign({}, m || {}, {
      icon:'💾',
      family:'Almacenamiento',
      sub:'Tarjetas microSD',
      official:(m && m.official) || 'Tarjeta microSD',
      tags:[...new Set([...(m && m.tags || []),'sd','micro sd','microsd','tarjeta','tarjeta sd','memoria','grabación','grabacion'])]
    });
  }

  // Baterías.
  if(has183(n,'battery','batt','batterybox','batterykit','internalbattery','hubbatt')){
    return Object.assign({}, m || {}, {
      icon:'🔋',
      family:'Alimentación',
      sub:'Baterías',
      official:(m && m.official) || 'Batería',
      tags:[...new Set([...(m && m.tags || []),'batería','bateria','battery','pila','alimentación','alimentacion','respaldo','backup'])]
    });
  }

  return m;
}

const descripcionProducto_PRE183 = descripcionProducto;
descripcionProducto = function(p){
  const m = meta183(p);
  let prev = null;
  try{ prev = descripcionProducto_PRE182 ? descripcionProducto_PRE182(p) : descripcionProducto_PRE183(p); }catch(e){
    try{ prev = descripcionProducto_PRE183(p); }catch(_){ prev = null; }
  }
  if(m){
    return {
      icon: m.icon || (prev && prev.icon) || '📦',
      // Importante: mantener descripción anterior buena. No pisar con meta.
      desc: (prev && prev.desc) || (m.desc) || 'Producto del catálogo',
      family: m.sub ? `${m.family} · ${m.sub}` : (m.family || (prev && prev.family) || 'Catálogo'),
      official: (prev && prev.official) || m.official || ref183(p)
    };
  }
  return prev || {icon:'📦', desc:'Producto del catálogo', family:'Producto nuevo', official:ref183(p)};
};

function textoIndex183(p){
  const m = meta183(p) || {};
  let prev = '';
  try{ const d = descripcionProducto_PRE182 ? descripcionProducto_PRE182(p) : descripcionProducto_PRE183(p); prev = [d.desc,d.family,d.official].join(' '); }catch(e){}
  return normaliza([
    ref183(p), p && p.brand,
    m.family, m.sub, m.official,
    (m.tags||[]).join(' '),
    prev,
    p && p._search175
  ].join(' '));
}

function construirIndice183(){
  try{
    productos.forEach((p,i)=>{
      p._idx183 = i;
      p._n183 = n183(p);
      p._tokens183 = p._n183.split(/[^a-z0-9]+/).filter(Boolean);
      p._search183 = textoIndex183(p);
    });
  }catch(e){}
}
const cargarCatalogo_PRE183 = cargarCatalogo;
cargarCatalogo = async function(){
  const r = await cargarCatalogo_PRE183();
  construirIndice183();
  return r;
};

function scoreProducto183(p, term){
  const q = normaliza(term).trim();
  if(!q) return 0;
  if(!p._search183) { p._n183 = n183(p); p._tokens183 = p._n183.split(/[^a-z0-9]+/).filter(Boolean); p._search183 = textoIndex183(p); }
  const n = p._n183 || n183(p);
  const search = p._search183 || '';
  const parts = q.split(/\s+/).filter(Boolean);
  let score = 0;
  if(n === q) score += 100000;
  if(n.startsWith(q)) score += 70000;
  if(n.includes(q)) score += 52000;
  if(search.includes(q)) score += 15000;
  for(const part of parts){
    if((p._tokens183||[]).includes(part)) score += 26000;
    else if(n.includes(part)) score += 17000;
    if(search.includes(part)) score += 6000;
  }
  const boost = (cond,val)=>{ if(cond) score += val; };
  boost(['enchufe','base enchufe','toma corriente','schuko','toma'].includes(q), has183(n,'socket','outlet','outletcore') ? 70000 : 0);
  boost(['fuente','fuente dc','alimentacion','alimentación','alimentador','dc','dc12','dc12v','dc12v2a','12v'].some(x=>q.includes(x)), has183(n,'dc12','dc1224','dc6','psu','ac220') ? 72000 : 0);
  boost(['bateria','batería','battery','pila'].some(x=>q.includes(x)), has183(n,'battery','batt','batterybox','batterykit','hubbatt') ? 70000 : 0);
  boost(q.includes('switch') || q === 'poe' || q.includes('switch poe'), has183(n,'sw1008poe','sw1005poe','vdms105gp','vdms108gp') ? 70000 : 0);
  boost(q.includes('inyector') || q.includes('injector'), has183(n,'inj-poe','injector') ? 75000 : 0);
  boost(q.includes('rack') || q.includes('armario') || q.includes('mural'), has183(n,'rack') ? 70000 : 0);
  boost(q.includes('ip66') || q.includes('estanca'), has183(n,'ip66') ? 70000 : 0);
  boost(q.includes('sd') || q.includes('micro sd') || q.includes('microsd') || q.includes('tarjeta'), has183(n,'hs-tf','microsd','tarjeta') ? 65000 : 0);
  boost(q.includes('disco') || q.includes('hdd') || q.includes('almacenamiento'), /^hd\d+tb/.test(n) || has183(n,'hdd') ? 65000 : 0);
  return score;
}

buscar = function(term){
  const q = normaliza(term).trim();
  if(!q) return [];
  return productos.map((p,i)=>({p,i,score:scoreProducto183(p,q),n:p._n183 || n183(p)}))
    .filter(x=>x.score>0)
    .sort((a,b)=>{
      const ae = a.n===q ? 0 : (a.n.startsWith(q)?1:(a.n.includes(q)?2:3));
      const be = b.n===q ? 0 : (b.n.startsWith(q)?1:(b.n.includes(q)?2:3));
      return ae-be || b.score-a.score || a.p.name.localeCompare(b.p.name,'es');
    })
    .slice(0,180);
};
buscarCatalogo = function(term=''){
  const q = String(term||'').trim();
  if(!q) return productos.map((p,i)=>({p,i,score:1})).sort((a,b)=>a.p.name.localeCompare(b.p.name,'es'));
  return buscar(q);
};

// Ajustar familias rápidas sin cambiar diseño.
try{
  const ali = FAMILIAS_RAPIDAS.find(f=>normaliza(f.title).includes('alimentacion') || normaliza(f.title).includes('alimentación'));
  if(ali){ ali.term = 'fuente dc bateria psu alimentacion'; ali.desc = 'Fuentes DC, PSU y baterías'; }
  const red = FAMILIAS_RAPIDAS.find(f=>normaliza(f.title).includes('red'));
  if(red){ red.term = 'switch poe inyector red ethernet'; red.desc = 'Switches PoE e inyectores'; }
  const acc = FAMILIAS_RAPIDAS.find(f=>normaliza(f.title).includes('soportes') || normaliza(f.title).includes('accesorios'));
  if(acc){ acc.term = 'soporte bracket holder mount junctionbox ip66 caja'; acc.desc = 'Soportes, cajas y montaje'; }
}catch(e){}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_183}`; });
});

/* =====================================================
   PATCH v1.8.6 PRO - Marca como conocimiento SIN tocar descripciones AJAX
   Objetivo:
   - Si brand/marca == AJAX: comportamiento anterior intacto.
   - Si brand/marca != AJAX: usar ese texto como conocimiento de búsqueda,
     descripción y clasificación SOLO para productos nuevos/no AJAX.
   - No sustituye las descripciones PRO existentes de AJAX_KNOWLEDGE.
   ===================================================== */
const APP_VERSION_186 = 'v1.8.6 PRO';

function brandInfo186(p){
  const b = String((p && p.brand) || '').trim();
  if(!b) return '';
  const nb = normaliza(b);
  if(nb === 'ajax') return '';
  // Marcas puras conocidas: se usan para búsqueda, pero no como descripción visible.
  if(['wester','western','western digital','hikvision','seagate','toshiba'].includes(nb)) return '';
  return b;
}
function rawText186(p){ return [String((p&&p.name)||''), String((p&&p.brand)||'')].join(' '); }
function nText186(p){ return normaliza(rawText186(p)); }
function has186(txt,...keys){ return keys.some(k => txt.includes(normaliza(k))); }

function metaMarca186(p){
  const raw = rawText186(p);
  const n = normaliza(raw);
  const know = brandInfo186(p);
  const tags = [];
  const add = (...xs)=>xs.forEach(x=>{ if(x) tags.push(x); });
  let meta = null;

  // Familias por nombre + por texto de marca/conocimiento. No toca descripción si AJAX.
  if(/(^|\b|-)dc\s*\d{1,2}\s*v/i.test(raw) || has186(n,'dc12v','dc 12v','dc12','dc24','12v 2a','12v2a','fuente dc','alimentacion dc','alimentación dc','psu','ac220v')){
    add('fuente','fuente dc','alimentación','alimentacion','alimentador','dc','12v','24v','psu','transformador');
    meta = {icon:'⚡', family:'Alimentación', sub:'Fuentes de alimentación DC / PSU', desc:know || 'Fuente de alimentación de baja tensión', tags};
  }else if(has186(n,'ip66','caja estanca','estanco','exterior')){
    add('ip66','caja','caja estanca','exterior','instalacion exterior','instalación exterior','agua','polvo');
    meta = {icon:'🧰', family:'Accesorios de instalación', sub:'Cajas estancas IP66', desc:know || 'Caja estanca IP66 para instalaciones exteriores', tags};
  }else if(has186(n,'rack-wall','rack wall') || /^rack/.test(n) || has186(n,'armario rack','rack mural')){
    add('rack','rack mural','armario','pared','mural','19','comunicaciones','nvr','switch','red');
    meta = {icon:'🗄️', family:'Infraestructura', sub:'Armarios Rack', desc:know || 'Armario rack mural para comunicaciones y videovigilancia', tags};
  }else if((has186(n,'poe') && (has186(n,'switch','sw1008','sw1005','vdms105','vdms108') || /^sw/.test(n))) || has186(n,'switch poe')){
    add('switch','switch poe','poe','red','ethernet','gigabit','cctv','camaras ip','cámaras ip','5 puertos','8 puertos');
    meta = {icon:'🌐', family:'Red / PoE', sub:'Switches PoE', desc:know || 'Switch PoE para alimentar y conectar dispositivos IP', tags};
  }else if(has186(n,'inj-poe','injector poe','inyector poe','poe injector','poe 30w')){
    add('inyector','inyector poe','injector poe','poe','red','ethernet','alimentacion poe','alimentación poe');
    meta = {icon:'⚡', family:'Red / PoE', sub:'Inyectores PoE', desc:know || 'Inyector PoE para alimentación por cable Ethernet', tags};
  }else if(/^hd\d+tb/.test(n) || has186(n,'hdd','disco duro','hard disk','surveillance')){
    add('disco','disco duro','hdd','almacenamiento','grabacion','grabación','nvr','vigilancia');
    meta = {icon:'💾', family:'Almacenamiento', sub:'Discos duros', desc:know || 'Disco duro para grabación de videovigilancia/NVR', tags};
  }else if(has186(n,'hs-tf','micro sd','microsd','tarjeta sd','tf card','sd card')){
    add('sd','micro sd','microsd','tarjeta','tarjeta sd','memoria','grabacion','grabación','camara','cámara');
    meta = {icon:'💽', family:'Almacenamiento', sub:'Tarjetas microSD', desc:know || 'Tarjeta microSD para almacenamiento de vídeo', tags};
  }else if(has186(n,'battery','batt','bateria','batería','pila')){
    add('bateria','batería','battery','pila','alimentacion','alimentación','respaldo','backup');
    meta = {icon:'🔋', family:'Alimentación', sub:'Baterías', desc:know || 'Batería o alimentación de respaldo', tags};
  }else if(has186(n,'abe-150','barrera','perimetral')){
    add('barrera','perimetral','seguridad perimetral','exterior','intrusion','intrusión');
    meta = {icon:'🛡️', family:'Seguridad perimetral', sub:'Barreras', desc:know || 'Barrera de seguridad perimetral', tags};
  }else if(know){
    // Producto nuevo no AJAX: conserva el texto de marca como conocimiento visible.
    add(...know.split(/[\s,;\/]+/).filter(Boolean));
    meta = {icon:'📦', family:'Productos añadidos', sub:'Pendiente de clasificación avanzada', desc:know, tags};
  }

  if(meta){
    meta.official = meta.desc;
    meta.tags = [...new Set(meta.tags || [])];
  }
  return meta;
}

const descripcionProducto_PRE186 = descripcionProducto;
descripcionProducto = function(p){
  const prev = descripcionProducto_PRE186(p);
  const know = brandInfo186(p);
  const meta = metaMarca186(p);
  // Si es AJAX, no se toca absolutamente nada.
  if(!know && normaliza(String((p&&p.brand)||'AJAX')) === 'ajax') return prev;
  if(meta){
    return {
      icon: meta.icon || (prev && prev.icon) || '📦',
      // Solo para productos no AJAX usamos marca/conocimiento como descripción.
      desc: meta.desc || (prev && prev.desc) || 'Producto del catálogo',
      family: meta.sub ? `${meta.family} · ${meta.sub}` : meta.family,
      official: (prev && prev.official) || String((p&&p.name)||'')
    };
  }
  return prev;
};

function textoIndex186(p){
  const prev = (p && (p._search183 || p._search182 || p._search175)) || '';
  const meta = metaMarca186(p) || {};
  const know = brandInfo186(p);
  return normaliza([
    p && p.name,
    p && p.brand,
    know,
    meta.family,
    meta.sub,
    meta.desc,
    (meta.tags||[]).join(' '),
    prev
  ].join(' '));
}
function construirIndice186(){
  try{
    productos.forEach((p,i)=>{
      p._idx186 = i;
      p._n186 = normaliza(String((p&&p.name)||''));
      p._tokens186 = p._n186.split(/[^a-z0-9]+/).filter(Boolean);
      p._search186 = textoIndex186(p);
    });
  }catch(e){}
}
const cargarCatalogo_PRE186 = cargarCatalogo;
cargarCatalogo = async function(){
  const r = await cargarCatalogo_PRE186();
  construirIndice186();
  return r;
};

const scoreProducto_PRE186 = (typeof scoreProducto183 === 'function') ? scoreProducto183 : scoreProducto;
function scoreProducto186(p, term){
  const q = normaliza(term).trim();
  if(!q) return 0;
  if(!p._search186){ p._n186 = normaliza(String((p&&p.name)||'')); p._tokens186 = p._n186.split(/[^a-z0-9]+/).filter(Boolean); p._search186 = textoIndex186(p); }
  const n = p._n186 || '';
  const search = p._search186 || '';
  const parts = q.split(/\s+/).filter(Boolean);
  let score = 0;
  try{ score += Math.max(0, scoreProducto_PRE186(p,q)); }catch(e){}
  if(n === q) score += 130000;
  if(n.startsWith(q)) score += 90000;
  if(n.includes(q)) score += 70000;
  if(search.includes(q)) score += 28000;
  for(const part of parts){
    if((p._tokens186||[]).includes(part)) score += 42000;
    else if(n.includes(part)) score += 26000;
    if(search.includes(part)) score += 12000;
  }
  const boost=(cond,val)=>{ if(cond) score+=val; };
  boost(['enchufe','base enchufe','toma corriente','schuko','toma'].includes(q), has186(nText186(p),'socket','outlet','outletcore') ? 90000 : 0);
  boost(q.includes('fuente') || q.includes('alimentacion') || q.includes('alimentación') || q.includes('dc12') || q.includes('12v'), has186(nText186(p),'dc12','dc1224','dc6','psu','ac220','fuente dc') ? 95000 : 0);
  boost(q.includes('switch') || q === 'poe' || q.includes('switch poe'), has186(nText186(p),'sw1008','sw1005','vdms105','vdms108','switch poe') ? 90000 : 0);
  boost(q.includes('inyector') || q.includes('injector'), has186(nText186(p),'inj-poe','injector poe','inyector poe') ? 90000 : 0);
  boost(q.includes('rack') || q.includes('armario') || q.includes('mural'), has186(nText186(p),'rack') ? 90000 : 0);
  boost(q.includes('ip66') || q.includes('estanca'), has186(nText186(p),'ip66') ? 90000 : 0);
  boost(q.includes('sd') || q.includes('microsd') || q.includes('micro sd') || q.includes('tarjeta'), has186(nText186(p),'hs-tf','microsd','tarjeta sd') ? 82000 : 0);
  boost(q.includes('disco') || q.includes('hdd') || q.includes('almacenamiento'), /^hd\d+tb/.test(n) || has186(nText186(p),'hdd','disco duro') ? 82000 : 0);
  return score;
}
buscar = function(term){
  const q = normaliza(term).trim();
  if(!q) return [];
  return productos.map((p,i)=>({p,i,score:scoreProducto186(p,q),n:p._n186 || normaliza(String((p&&p.name)||''))}))
    .filter(x=>x.score>0)
    .sort((a,b)=>{
      const ae = a.n===q ? 0 : (a.n.startsWith(q)?1:(a.n.includes(q)?2:3));
      const be = b.n===q ? 0 : (b.n.startsWith(q)?1:(b.n.includes(q)?2:3));
      return ae-be || b.score-a.score || a.p.name.localeCompare(b.p.name,'es');
    })
    .slice(0,180);
};
buscarCatalogo = function(term=''){
  const q = String(term||'').trim();
  if(!q) return productos.map((p,i)=>({p,i,score:1})).sort((a,b)=>a.p.name.localeCompare(b.p.name,'es'));
  return buscar(q);
};

// Familias rápidas: ampliar términos sin tocar las existentes.
try{
  if(typeof FAMILIAS_RAPIDAS !== 'undefined'){
    const ali = FAMILIAS_RAPIDAS.find(f=>normaliza(f.title).includes('alimentacion') || normaliza(f.title).includes('alimentación') || normaliza(f.title).includes('bateria'));
    if(ali){ ali.term = 'fuente dc dc12v psu ac220 bateria battery alimentacion 12v'; ali.desc = 'Fuentes DC, PSU y baterías'; }
    const red = FAMILIAS_RAPIDAS.find(f=>normaliza(f.title).includes('red') || normaliza(f.title).includes('poe'));
    if(red){ red.term = 'switch poe inyector poe injector poe red ethernet'; red.desc = 'Switches PoE e inyectores'; }
  }
}catch(e){}

document.addEventListener('DOMContentLoaded',()=>{
  try{ document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_186}`; }); }catch(e){}
});


/* =====================================================
   PATCH v1.8.7 PRO - Búsqueda limpia WiFi / LTE / 4G / Hub Plus
   - wifi / wi-fi / wi fi => SOLO AJ-HUB2PLUS.
   - hubplus / hub plus / hub 2 plus => SOLO AJ-HUB2PLUS.
   - lte se trata igual que 4g.
   - 4g/lte evita falsos positivos tipo 64G, baterías o accesorios.
   - Mantiene CSV como fuente principal para el resto de búsquedas.
   ===================================================== */
const APP_VERSION_187 = 'v1.8.7 PRO';

function q187(term){
  const q = normaliza(term).trim();
  if(q === 'wi fi' || q === 'wi-fi') return 'wifi';
  if(q === 'lte') return '4g';
  if(q === 'hubplus' || q === 'hub plus' || q === 'hub 2 plus' || q === 'hub2 plus') return 'hub2plus';
  return q;
}
function n187(p){ return normaliza(String((p && p.name) || '')); }
function isHub2Plus187(p){
  const n = n187(p);
  return n === 'aj-hub2plus-b' || n === 'aj-hub2plus-w';
}
function isHub4G187(p){
  const n = n187(p);
  // Centrales/kits con comunicación LTE/4G real. Evita tarjetas 64G, baterías y soportes.
  if(n.includes('hubbatt') || n.includes('battery') || n.includes('batt') || n.includes('bracket') || n.includes('repairkit')) return false;
  if(n.includes('hub2-4g') || n.includes('hub2kit4g')) return true;
  if(n.includes('hub2plus') || n.includes('hubbp')) return true;
  if(n.includes('starterkit') && n.includes('4g')) return true;
  return false;
}
function specialResults187(term){
  const q = q187(term);
  if(q === 'wifi' || q === 'hub2plus'){
    return productos
      .map((p,i)=>({p,i,score:isHub2Plus187(p) ? 1000000 : 0,n:n187(p)}))
      .filter(x=>x.score>0)
      .sort((a,b)=>a.p.name.localeCompare(b.p.name,'es'));
  }
  if(q === '4g'){
    return productos
      .map((p,i)=>({p,i,score:isHub4G187(p) ? 900000 + (isHub2Plus187(p) ? 50000 : 0) : 0,n:n187(p)}))
      .filter(x=>x.score>0)
      .sort((a,b)=>b.score-a.score || a.p.name.localeCompare(b.p.name,'es'));
  }
  return null;
}

const buscar_PRE187 = buscar;
buscar = function(term){
  const forced = specialResults187(term);
  if(forced) return forced.slice(0, 40);
  return buscar_PRE187(term);
};

const buscarCatalogo_PRE187 = buscarCatalogo;
buscarCatalogo = function(term=''){
  const forced = specialResults187(term);
  if(forced) return forced.slice(0, 40);
  return buscarCatalogo_PRE187(term);
};

document.addEventListener('DOMContentLoaded',()=>{
  try{ document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_187}`; }); }catch(e){}
});

/* =====================================================
   PATCH v1.8.8 PRO - Descripciones precisas para KIT Ajax
   - Las referencias AJ-HUB2KIT... dejan de describirse como "kit básico".
   - Interpreta HUB2 / 4G / MP / DP / PHOD / PRO / color.
   - Ajusta búsqueda para que "kit", "kit alarma", "kit 4g" y variantes prioricen kits reales.
   ===================================================== */
const APP_VERSION_188 = 'v1.8.8 PRO';

function ref188(p){ return String((p && p.name) || '').trim(); }
function n188(p){ return normaliza(ref188(p)); }
function isAjaxKit188(p){
  const n = n188(p);
  return /^aj-hub2kit/.test(n) || n.includes('starterkit');
}
function color188(n){
  if(/-w$/.test(n) || n.endsWith('white')) return 'Blanco';
  if(/-b$/.test(n) || n.endsWith('black')) return 'Negro';
  return '';
}
function kitDesc188(p){
  const n = n188(p);
  if(!isAjaxKit188(p)) return null;

  let hub = 'Hub 2';
  if(n.includes('hub2plus')) hub = 'Hub 2 Plus';
  if(n.includes('hubbp')) hub = 'Hub BP';
  if(n.includes('hubhybrid')) hub = 'Hub Hybrid';
  if(n.includes('hub2kit4g') || n.includes('hub2-4g') || /(^|-)4g($|-)/.test(n)) hub += ' 4G';

  const piezas = [];
  if(/(^|-)mp($|-)/.test(n) || n.includes('motionprotect')) piezas.push('MotionProtect');
  if(/(^|-)dp($|-)/.test(n) || n.includes('doorprotect')) piezas.push('DoorProtect');
  if(/(^|-)phod($|-)/.test(n) || n.includes('phod')) piezas.push('dispositivos Photo On Demand');
  if(/(^|-)pro($|-)/.test(n)) piezas.push('accesorios Professional');

  const c = color188(n);
  let desc = `Kit de alarma Ajax ${hub}${c ? ' ' + c : ''}`;
  if(piezas.length){
    desc += ` con ${piezas.join(', ')}`;
  }else{
    desc += ' con central y accesorios incluidos';
  }
  return {
    icon: '📦',
    desc,
    family: 'Kits Ajax · Alarma',
    official: ref188(p),
    tags: ['kit','kit ajax','kit alarma','starter','alarma completa','pack alarma','hub','central','ajax']
  };
}

const descripcionProducto_PRE188 = descripcionProducto;
descripcionProducto = function(p){
  const k = kitDesc188(p);
  if(k) return k;
  return descripcionProducto_PRE188(p);
};

const scoreProducto_PRE188 = (typeof scoreProducto186 === 'function') ? scoreProducto186 : scoreProducto;
function scoreProducto188(p, term){
  const q = q187 ? q187(term) : normaliza(term).trim();
  if(!q) return 0;
  const n = n188(p);
  const isKit = isAjaxKit188(p);
  let score = 0;
  try{ score += Math.max(0, scoreProducto_PRE188(p, q)); }catch(e){}

  // Intención clara de kit: prioriza kits reales y baja centrales sueltas.
  const wantsKit = q === 'kit' || q.includes('kit ') || q.includes(' kit') || q.includes('kit alarma') || q.includes('kit ajax') || q.includes('starter') || q.includes('pack alarma');
  if(wantsKit){
    score += isKit ? 350000 : -80000;
    if(isKit && q.includes('4g')) score += n.includes('kit4g') ? 160000 : -50000;
    if(isKit && (q.includes('motion') || q.includes('mp'))) score += /(^|-)mp($|-)/.test(n) ? 90000 : 0;
    if(isKit && (q.includes('door') || q.includes('dp') || q.includes('puerta'))) score += /(^|-)dp($|-)/.test(n) ? 90000 : 0;
    if(isKit && (q.includes('phod') || q.includes('foto') || q.includes('photo'))) score += /(^|-)phod($|-)/.test(n) ? 90000 : 0;
    if(isKit && (q.includes('pro') || q.includes('professional'))) score += /(^|-)pro($|-)/.test(n) ? 70000 : 0;
  }

  // Consulta "hub 4g" o "central 4g": primero centrales, después kits.
  const wantsHub4g = (q.includes('hub') || q.includes('central')) && q.includes('4g');
  if(wantsHub4g && isKit) score -= 60000;

  // Búsqueda por la propia referencia del kit.
  if(isKit && n.includes(q)) score += 240000;

  return score;
}

function ordenar188(arr, q){
  return arr.filter(x=>x.score>0).sort((a,b)=>{
    const an = n188(a.p), bn = n188(b.p);
    const ak = isAjaxKit188(a.p), bk = isAjaxKit188(b.p);
    const wantsKit = q === 'kit' || q.includes('kit ') || q.includes(' kit') || q.includes('kit alarma') || q.includes('kit ajax') || q.includes('starter') || q.includes('pack alarma');
    if(wantsKit && ak !== bk) return ak ? -1 : 1;
    const ae = an===q ? 0 : (an.startsWith(q)?1:(an.includes(q)?2:3));
    const be = bn===q ? 0 : (bn.startsWith(q)?1:(bn.includes(q)?2:3));
    return ae-be || b.score-a.score || a.p.name.localeCompare(b.p.name,'es');
  });
}

const buscar_PRE188 = buscar;
buscar = function(term){
  const q = q187 ? q187(term) : normaliza(term).trim();
  if(!q) return [];
  const wantsKit = q === 'kit' || q.includes('kit ') || q.includes(' kit') || q.includes('kit alarma') || q.includes('kit ajax') || q.includes('starter') || q.includes('pack alarma');
  if(wantsKit){
    return ordenar188(productos.map((p,i)=>({p,i,score:scoreProducto188(p,q)})), q).slice(0,80);
  }
  return buscar_PRE188(term);
};

const buscarCatalogo_PRE188 = buscarCatalogo;
buscarCatalogo = function(term=''){
  const q = q187 ? q187(term) : normaliza(term).trim();
  if(!q) return productos.map((p,i)=>({p,i,score:1})).sort((a,b)=>a.p.name.localeCompare(b.p.name,'es'));
  const wantsKit = q === 'kit' || q.includes('kit ') || q.includes(' kit') || q.includes('kit alarma') || q.includes('kit ajax') || q.includes('starter') || q.includes('pack alarma');
  if(wantsKit){
    return ordenar188(productos.map((p,i)=>({p,i,score:scoreProducto188(p,q)})), q).slice(0,120);
  }
  return buscarCatalogo_PRE188(term);
};

document.addEventListener('DOMContentLoaded',()=>{
  try{ document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_188}`; }); }catch(e){}
});

/* =====================================================
   PATCH v1.8.9 PRO - NVR canales precisos
   - Corrige referencias Ajax NVR 108/208 = 8 canales.
   - 116/216 = 16 canales, 232 = 32 canales.
   - Evita deducir canales por coincidencias falsas dentro del código.
   ===================================================== */
const APP_VERSION_189 = 'v1.8.9 PRO';

function ref189(p){ return String((p && p.name) || '').trim(); }
function n189(p){ return normaliza(ref189(p)); }
function isNvrAjax189(p){
  const n = n189(p);
  return /^aj-nvr/.test(n) && !n.includes('psu');
}
function nvrChannels189(p){
  const n = n189(p);
  // En Ajax, estos códigos indican capacidad de canales:
  // 108/208/KIT108 => 8 canales; 116/216 => 16 canales; 232 => 32 canales.
  if(/nvr(?:kit)?108/.test(n) || /nvr208/.test(n)) return 8;
  if(/nvr116/.test(n) || /nvr216/.test(n)) return 16;
  if(/nvr232/.test(n)) return 32;
  if(/(^|-)8ch($|-)/.test(n) || /(^|-)8-ch($|-)/.test(n)) return 8;
  if(/(^|-)16ch($|-)/.test(n) || /(^|-)16-ch($|-)/.test(n)) return 16;
  if(/(^|-)32ch($|-)/.test(n) || /(^|-)32-ch($|-)/.test(n)) return 32;
  return null;
}
function nvrPoePorts189(p){
  const n = n189(p);
  if(/(^|-)16p($|-)/.test(n)) return 16;
  if(/(^|-)8p($|-)/.test(n)) return 8;
  return null;
}
function nvrDesc189(p){
  if(!isNvrAjax189(p)) return null;
  const n = n189(p);
  const ch = nvrChannels189(p);
  const poe = nvrPoePorts189(p);
  const c = color188 ? color188(n) : (/\-w$/.test(n) ? 'Blanco' : (/\-b$/.test(n) ? 'Negro' : ''));
  const esKit = n.includes('nvrkit');
  let desc = esKit ? 'Kit de videovigilancia Ajax' : 'Grabador de vídeo en red Ajax NVR';
  if(ch) desc += ` de ${ch} canales`;
  if(n.includes('ai')) desc += ' con IA';
  if(n.includes('hac') || n.includes('hdc')) desc += ' con salida HDMI';
  if(poe) desc += ` y ${poe} puertos PoE`;
  if(n.includes('dc') || n.includes('hdc')) desc += ' alimentado por baja tensión';
  if(c) desc += ` ${c}`;
  if(esKit){
    if(n.includes('bullet')) desc += ' con cámaras BulletCam incluidas';
    if(n.includes('turret')) desc += ' con cámaras TurretCam incluidas';
  }
  return {
    icon:'💾',
    desc,
    family: esKit ? 'Kits Ajax · Videovigilancia' : 'Grabadores NVR Ajax',
    official: ref189(p),
    tags:['nvr','grabador','videograbador','camaras','cámaras','canales','hdmi','hdd','videovigilancia'].concat(ch ? [`${ch} canales`, `${ch}ch`] : []).concat(poe ? [`${poe} poe`, `${poe} puertos poe`] : [])
  };
}

const descripcionProducto_PRE189 = descripcionProducto;
descripcionProducto = function(p){
  const nvr = nvrDesc189(p);
  if(nvr) return nvr;
  return descripcionProducto_PRE189(p);
};

const scoreProducto_PRE189 = scoreProducto;
scoreProducto = function(p, term){
  const q = q187 ? q187(term) : normaliza(term).trim();
  if(!q) return 0;
  let score = 0;
  try{ score += Math.max(0, scoreProducto_PRE189(p, q)); }catch(e){}
  if(isNvrAjax189(p)){
    const ch = nvrChannels189(p);
    const poe = nvrPoePorts189(p);
    if(q.includes('nvr') || q.includes('grabador') || q.includes('videograbador')) score += 120000;
    if(ch && (q.includes(`${ch} canales`) || q.includes(`${ch} canal`) || q.includes(`${ch}ch`))) score += 160000;
    if(q.includes('8 canales') || q.includes('8ch') || q.includes('ocho canales')) score += ch === 8 ? 180000 : -90000;
    if(q.includes('16 canales') || q.includes('16ch') || q.includes('dieciseis') || q.includes('dieciséis')) score += ch === 16 ? 180000 : -90000;
    if(q.includes('32 canales') || q.includes('32ch')) score += ch === 32 ? 180000 : -90000;
    if(q.includes('poe')) score += poe ? 120000 : -30000;
    if(q.includes('hdmi')) score += (n189(p).includes('hac') || n189(p).includes('hdc')) ? 90000 : 0;
    if(q.includes('ia') || q.includes('ai')) score += n189(p).includes('ai') ? 90000 : 0;
  }
  return score;
};

document.addEventListener('DOMContentLoaded',()=>{
  try{ document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_189}`; }); }catch(e){}
});

/* =====================================================
   PATCH v1.9.0 PRO - CurtainProtect / detectores cortina
   - Corrige CurtainProtect, CurtainOutdoor, DualCurtainOutdoor y CurtainCamOutdoor.
   - Nunca los clasifica como puerta/ventana.
   - Añade búsqueda precisa para "cortina", "curtain", "perimetral".
   ===================================================== */
const APP_VERSION_190 = 'v1.9.0 PRO';

function ref190(p){ return String((p && p.name) || '').trim(); }
function n190(p){ return normaliza(ref190(p)); }
function color190(n){
  if(typeof color188 === 'function') return color188(n);
  if(/-w$/.test(n) || n.endsWith('white')) return 'Blanco';
  if(/-b$/.test(n) || n.endsWith('black')) return 'Negro';
  return '';
}
function isCurtainAjax190(p){
  const n = n190(p);
  return n.includes('curtainprotect') || n.includes('curtainoutdoor') || n.includes('dualcurtainoutdoor') || n.includes('curtaincamoutdoor') || n.includes('dualcurtain');
}
function isDoorAjax190(p){
  const n = n190(p);
  // DoorBell es timbre/cámara, no DoorProtect. Curtain no es puerta/ventana.
  return !isCurtainAjax190(p) && !n.includes('doorbell') && (n.includes('doorprotect') || /^aj-doorprotect/.test(n));
}
function curtainDesc190(p){
  if(!isCurtainAjax190(p)) return null;
  const n = n190(p);
  const c = color190(n);
  const dummy = n.includes('dummy');
  let official = 'CurtainProtect';
  let desc = 'Detector de movimiento Ajax tipo cortina';
  let sub = 'Detectores tipo cortina';
  let icon = '🛡️';

  if(n.includes('curtaincamoutdoor')){
    official = 'CurtainCam Outdoor';
    desc = 'Detector exterior Ajax tipo cortina con cámara y verificación fotográfica';
    sub = 'Detectores exteriores con cámara';
    icon = '📷';
    if(n.includes('highmount')) desc += ' para montaje alto';
    if(n.includes('phod')) desc += ' Photo On Demand';
  }else if(n.includes('dualcurtainoutdoor') || n.includes('dualcurtain')){
    official = 'DualCurtain Outdoor';
    desc = 'Detector exterior Ajax de movimiento tipo cortina doble para protección perimetral';
    sub = 'Detectores exteriores tipo cortina';
  }else if(n.includes('curtainoutdoor')){
    official = 'Curtain Outdoor';
    desc = 'Detector exterior Ajax de movimiento tipo cortina para protección perimetral';
    sub = 'Detectores exteriores tipo cortina';
    if(n.includes('mini')) official = 'Curtain Outdoor Mini';
    if(n.includes('mini')) desc = 'Detector exterior Ajax Curtain Outdoor Mini tipo cortina para protección perimetral';
  }else if(n.includes('curtainprotect')){
    official = 'CurtainProtect';
    desc = 'Detector inalámbrico Ajax de movimiento tipo cortina para proteger accesos, pasillos y perímetros interiores';
    sub = 'Detectores interiores tipo cortina';
  }

  if(dummy) desc = `Maqueta/demo ${official} sin electrónica funcional`;
  if(c) desc += ` ${c}`;

  return {
    icon,
    desc,
    family: `Protección contra intrusiones · ${sub}`,
    official,
    tags: [
      'curtain','cortina','detector cortina','tipo cortina','barrera cortina','movimiento','pir','perimetral','perimetro','perímetro',
      'proteccion perimetral','protección perimetral','exterior','interior','pasillo','ventanal','acceso', official.toLowerCase()
    ]
  };
}
function doorDesc190(p){
  if(!isDoorAjax190(p)) return null;
  const n = n190(p);
  const c = color190(n);
  const dummy = n.includes('dummy');
  let official = n.includes('doorprotectplus') ? 'DoorProtect Plus' : 'DoorProtect';
  let desc = n.includes('doorprotectplus')
    ? 'Detector magnético Ajax de apertura con sensor de impacto e inclinación para puerta o ventana'
    : 'Detector magnético Ajax de apertura para puerta o ventana';
  if(dummy) desc = `Maqueta/demo ${official} sin electrónica funcional`;
  if(c) desc += ` ${c}`;
  return {
    icon:'🚪',
    desc,
    family:'Protección contra intrusiones · Puertas / ventanas',
    official,
    tags:['doorprotect','door','puerta','ventana','apertura','contacto magnetico','contacto magnético','iman','imán','magnético','magnetico',official.toLowerCase()]
  };
}

const descripcionProducto_PRE190 = descripcionProducto;
descripcionProducto = function(p){
  const cur = curtainDesc190(p);
  if(cur) return cur;
  const door = doorDesc190(p);
  if(door) return door;
  return descripcionProducto_PRE190(p);
};

const scoreProducto_PRE190 = scoreProducto;
scoreProducto = function(p, term){
  const q = q187 ? q187(term) : normaliza(term).trim();
  if(!q) return 0;
  let score = 0;
  try{ score += Math.max(0, scoreProducto_PRE190(p, q)); }catch(e){}
  const isCurtain = isCurtainAjax190(p);
  const isDoor = isDoorAjax190(p);
  const n = n190(p);

  const wantsCurtain = q.includes('curtain') || q.includes('cortina') || q.includes('barrera cortina') || q.includes('tipo cortina');
  if(wantsCurtain){
    score += isCurtain ? 260000 : -120000;
    if(isCurtain && n.includes(q.replace(/\s+/g,''))) score += 90000;
    if(isCurtain && q.includes('outdoor')) score += n.includes('outdoor') ? 80000 : -30000;
    if(isCurtain && (q.includes('exterior') || q.includes('perimetral'))) score += n.includes('outdoor') || n.includes('dualcurtain') || n.includes('curtaincamoutdoor') ? 70000 : 10000;
    if(isCurtain && (q.includes('cam') || q.includes('camara') || q.includes('cámara') || q.includes('phod') || q.includes('foto'))) score += n.includes('cam') || n.includes('phod') ? 80000 : -20000;
  }

  const wantsDoorWindow = q.includes('doorprotect') || q.includes('puerta') || q.includes('ventana') || q.includes('apertura') || q.includes('magnetico') || q.includes('magnético');
  if(wantsDoorWindow){
    if(isCurtain) score -= 220000; // evita que Curtain salga como puerta/ventana
    if(isDoor) score += 180000;
  }

  return score;
};

function specialResults190(term){
  const q = q187 ? q187(term) : normaliza(term).trim();
  const wantsCurtain = q && (q.includes('curtain') || q.includes('cortina') || q.includes('barrera cortina') || q.includes('tipo cortina'));
  if(!wantsCurtain) return null;
  return productos
    .map((p,i)=>({p,i,score:scoreProducto(p,q)}))
    .filter(x=>x.score>0 && isCurtainAjax190(x.p))
    .sort((a,b)=>b.score-a.score || a.p.name.localeCompare(b.p.name,'es'));
}

const buscar_PRE190 = buscar;
buscar = function(term){
  const forced = specialResults190(term);
  if(forced) return forced.slice(0,80);
  return buscar_PRE190(term);
};

const buscarCatalogo_PRE190 = buscarCatalogo;
buscarCatalogo = function(term=''){
  const forced = specialResults190(term);
  if(forced) return forced.slice(0,120);
  return buscarCatalogo_PRE190(term);
};

document.addEventListener('DOMContentLoaded',()=>{
  try{ document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_190}`; }); }catch(e){}
});

/* =====================================================
   PATCH v1.9.1 PRO - Descripciones Ajax afinadas desde catálogo oficial pegado
   - Usa textos reales del catálogo pegado por David para familias nuevas.
   - Corrige cámaras, timbre, teclados, incendio, NVR, relés, enchufes, LifeQuality, WaterStop, módulos.
   - Mantiene prioridad de parches anteriores: kits, NVR canales y Curtain.
   ===================================================== */
const APP_VERSION_191 = 'v1.9.1 PRO';
function ref191(p){ return String((p && p.name) || '').trim(); }
function n191(p){ return normaliza(ref191(p)); }
function color191(n){
  if(typeof color190 === 'function') return color190(n);
  if(/-w$/.test(n)) return 'Blanco';
  if(/-b$/.test(n)) return 'Negro';
  if(/-gra$/.test(n)) return 'Grafito';
  if(/-gre$/.test(n)) return 'Gris';
  return '';
}
function addColor191(desc,n){ const c=color191(n); return c ? desc + ' ' + c : desc; }
function camLens191(n){ return n.includes('0400') || /-4($|-)/.test(n) ? '4 mm' : (n.includes('0280') || n.includes('2-8') ? '2.8 mm' : ''); }
function camMp191(n){ const m = n.match(/(?:^|-)cam-(\d)(?:-|$)|(?:bulletcam|domecam|turretcam|indoorcam|doorbell)-(\d)(?:-|$)/); return m ? (m[1]||m[2]) : ''; }
function isCamera191(n){ return n.includes('bulletcam') || n.includes('domecam') || n.includes('turretcam') || n.includes('indoorcam') || n.includes('doorbell'); }
function preciseDesc191(p){
  const raw = ref191(p); const n = n191(p); const tags = [];

  // Cámaras cableadas / Wi-Fi / timbre. Basado en textos del catálogo pegado.
  if(isCamera191(n)){
    let shape = n.includes('bulletcam') ? 'BulletCam' : n.includes('domecam') ? 'DomeCam Mini' : n.includes('turretcam') ? 'TurretCam' : n.includes('doorbell') ? 'DoorBell' : 'IndoorCam';
    const mp = camMp191(n); const lens = camLens191(n);
    const hl = n.includes('hlvf') || n.includes('-hl-') || n.endsWith('-hl');
    const vf = n.includes('hlvf');
    let desc = '';
    if(n.includes('doorbell')) desc = 'Vídeo timbre Ajax con IA integrada, sensor PIR y control desde la app';
    else if(n.includes('indoorcam')) desc = 'Cámara de seguridad Wi-Fi Ajax para interiores con sensor de movimiento PIR e IA integrada';
    else desc = `Cámara IP Ajax ${shape}${mp ? ' de '+mp+' MP' : ''}${lens ? ' / '+lens : ''} con IA, True WDR, micrófono y alimentación PoE/12 V`;
    if(!n.includes('doorbell') && !n.includes('indoorcam')){
      desc += n.includes('domecam') || n.includes('turretcam') || n.includes('bulletcam') ? '. Para exteriores e interiores' : '';
      if(hl) desc += vf ? ', objetivo varifocal motorizado e iluminación híbrida' : ', iluminación híbrida';
      else desc += ', iluminación IR';
    }
    desc = addColor191(desc,n);
    tags.push('camara','cámara','ip','ia','video','vídeo','poe','12v','true wdr','microfono','micrófono',shape.toLowerCase(),mp?mp+' mp':'',lens,hl?'iluminacion hibrida':'ir',vf?'varifocal':'');
    if(n.includes('doorbell')) tags.push('timbre','videoportero','doorbell','pir');
    if(n.includes('indoorcam')) tags.push('wifi','wi-fi','interior','indoorcam','pir');
    return {icon:n.includes('doorbell')?'🔔':'📷', family:n.includes('doorbell')?'Timbres Ajax':'Cámaras Ajax', official:shape, desc, tags};
  }

  // Teclados.
  if(n.includes('keypad')){
    let official='KeyPad', desc='Teclado inalámbrico Ajax para control del sistema de alarma mediante códigos';
    if(n.includes('outdoor')){ official='KeyPad Outdoor'; desc='Teclado inalámbrico Ajax para exteriores e interiores que admite Pass, Tag, smartphones y códigos'; }
    else if(n.includes('touchscreen')){ official='KeyPad TouchScreen'; desc='Teclado inalámbrico Ajax con pantalla táctil que admite smartphones, Pass, Tag y códigos'; }
    else if(n.includes('keypadplus')){ official='KeyPad Plus'; desc='Teclado inalámbrico y táctil Ajax compatible con tarjetas y mandos cifrados sin contacto'; }
    else if(n.includes('keypadcombi')){ official='KeyPad Combi'; desc='Teclado inalámbrico Ajax con sirena integrada, compatible con Pass, Tag y códigos'; }
    desc = addColor191(desc,n);
    return {icon:'⌨️', family:'Teclados Ajax', official, desc, tags:['teclado','keypad','codigo','código','pass','tag','smartphone','autenticacion','autenticación',official.toLowerCase()]};
  }

  // FireProtect 2 y EN54.
  if(n.includes('fireprotect') || n.includes('manualcallpoint')){
    if(n.includes('manualcallpoint')){
      let color = n.includes('blue')?'azul':n.includes('green')?'verde':n.includes('yellow')?'amarillo':n.includes('white')?'blanco':'rojo';
      return {icon:'🧯', family:'Pulsadores manuales de alarma Ajax', official:'ManualCallPoint', desc:`Botón inalámbrico Ajax reajustable y programable de color ${color}`, tags:['pulsador','boton','botón','manualcallpoint','alarma','incendio',color]};
    }
    const hasH = /fireprotect2-(h|hc|hs|hsc)/.test(n) || n.includes('heat');
    const hasS = /fireprotect2-(s|hs|hsc)/.test(n) || n.includes('smoke');
    const hasC = /fireprotect2-(c|hc|hsc)/.test(n) || n.includes('co') || n.includes('plus');
    const ac = n.includes('-ac-'); const rb = n.includes('-rb-'); const sb = n.includes('-sb-');
    let sensores=[]; if(hasS) sensores.push('humo'); if(hasH) sensores.push('calor'); if(hasC) sensores.push('CO');
    let desc = n.includes('fireprotect2') ? `Detector inalámbrico Ajax FireProtect 2 de ${sensores.length?sensores.join(', '):'incendio'}` : (n.includes('plus') ? 'Detector inalámbrico Ajax FireProtect Plus de calor, humo y CO' : 'Detector inalámbrico Ajax FireProtect de incendio con sensores de calor y humo');
    if(ac) desc += ' alimentado por red eléctrica';
    if(rb) desc += ' con baterías reemplazables';
    if(sb) desc += ' con baterías integradas';
    desc = addColor191(desc,n);
    return {icon:'🔥', family:'Detectores de incendio Ajax', official:n.includes('fireprotect2')?'FireProtect 2':(n.includes('plus')?'FireProtect Plus':'FireProtect'), desc, tags:['incendio','fuego','humo','calor','co','monoxido','monóxido','fireprotect','detector',ac?'ac':'',rb?'rb bateria reemplazable':'',sb?'sb bateria integrada':'']};
  }

  // NVR: añade descripción más oficial sin tocar canales ya corregidos en v1.8.9.
  if(typeof isNvrAjax189 === 'function' && isNvrAjax189(p)){
    const ch = nvrChannels189(p); const poe = nvrPoePorts189(p);
    let desc = `Grabador de vídeo en red Ajax${ch?' de '+ch+' canales':''}`;
    if(n.includes('ai')) desc += ' con IA';
    if(n.includes('h2d') || n.includes('hac') || n.includes('hdc')) desc += ' con salida HDMI 4K';
    if(poe) desc += `, ${poe} puertos PoE`;
    if(n.includes('2g')) desc += ', 2 puertos Gigabit Ethernet';
    if(n.includes('dc') || n.includes('hdc')) desc += ' y alimentación de baja tensión';
    desc += ' y soporte para discos duros';
    return {icon:'💾', family:'Grabadores NVR Ajax', official:'NVR', desc, tags:['nvr','grabador','videograbador','video','vídeo','canales','hdmi','4k','hdd','disco duro','poe',ch?ch+' canales':'',poe?poe+' poe':'']};
  }

  // Automatización, enchufes, relés, switches.
  if(n.includes('lightswitch') || n.includes('lightcore')){
    let vias = n.includes('dimmer')?'Dimmer':n.includes('cross')||n.includes('crossover')?'cruce':n.includes('2g2w')?'2 bandas y 2 vías':n.includes('2g')?'2 bandas':n.includes('2w')?'2 vías':'1 banda';
    return {icon:'💡', family:'Interruptores de luz Ajax', official:'LightSwitch', desc:`Interruptor de luz inteligente Ajax táctil de ${vias}`, tags:['interruptor','luz','lightswitch','lightcore','tactil','táctil','dimmer','domotica','domótica',vias]};
  }
  if(n.includes('outlet')){
    const lan = n.includes('lan');
    return {icon:'🔌', family:'Bases de enchufe Ajax', official:lan?'Outlet LAN':'Outlet', desc: lan?'Base de enchufe Ethernet Ajax con dos puertos':'Base de enchufe inteligente Ajax con monitor de consumo eléctrico', tags:['enchufe','base','outlet','socket','consumo','ethernet',lan?'lan':'']};
  }
  if(n.includes('socket')){
    return {icon:'🔌', family:'Enchufes inteligentes Ajax', official:'Socket', desc:'Enchufe inteligente Ajax con monitor de consumo eléctrico', tags:['enchufe','socket','consumo','inteligente','domotica','domótica']};
  }
  if(n.includes('relay') || n.includes('wallswitch')){
    const multi = n.includes('multirelay');
    const wall = n.includes('wallswitch');
    let desc = multi ? 'Relé Ajax de cuatro canales de control remoto' : (wall ? 'Relé de potencia Ajax para controlar la alimentación 110/230 V en remoto' : 'Relé inalámbrico Ajax de contacto seco');
    return {icon:'⚡', family:'Relés Ajax', official:multi?'MultiRelay':(wall?'WallSwitch':'Relay'), desc, tags:['rele','relé','relay','wallswitch','contacto seco','control remoto','domotica','domótica']};
  }

  // Aire / inundación / agua.
  if(n.includes('lifequality')){
    const lite = n.includes('lite');
    return {icon:'🌡️', family:'Detectores de calidad del aire Ajax', official:lite?'LifeQuality Lite':'LifeQuality', desc: lite?'Monitor inalámbrico Ajax de temperatura y humedad':'Monitor inalámbrico Ajax de temperatura, humedad y CO₂', tags:['temperatura','humedad','co2','co₂','calidad aire','lifequality','monitor',lite?'lite':'']};
  }
  if(n.includes('leaksprotect')){
    return {icon:'💧', family:'Detectores de inundación Ajax', official:'LeaksProtect', desc:addColor191('Detector inalámbrico Ajax de inundación',n), tags:['inundacion','inundación','agua','fuga','leaksprotect','detector inundacion']};
  }
  if(n.includes('waterstop')){
    let tam = raw.match(/(1\"|½\"|¾\"|DN\s?\d+)/i); tam = tam ? ' '+tam[1] : '';
    return {icon:'🚰', family:'Válvulas de cierre Ajax', official:'WaterStop', desc:`Válvula de cierre de agua Ajax inalámbrica de control remoto${tam}`, tags:['waterstop','valvula','válvula','agua','cierre','llave','fuga','inundacion']};
  }

  // Módulos de integración y Fibra.
  if(n.includes('multitransmitter') || n.includes('transmitter') || n.includes('vhfbridge')){
    let official = n.includes('multitransmitter')?'MultiTransmitter':n.includes('vhfbridge')?'vhfBridge':'Transmitter';
    let desc = n.includes('multitransmitter') ? 'Módulo Ajax para integrar hasta 18 dispositivos de terceros en el sistema' : n.includes('vhfbridge') ? 'Módulo Ajax para conectar el sistema a transmisores VHF de terceros' : 'Módulo Ajax para integrar un dispositivo de terceros en el sistema';
    if(n.includes('fibra')) desc = desc.replace('Módulo Ajax','Módulo cableado Ajax Fibra');
    else desc = desc.replace('Módulo Ajax','Módulo inalámbrico Ajax');
    if(n.includes('4x4')) desc += ' con 4 entradas y 4 salidas';
    return {icon:'🔗', family:'Módulos de integración Ajax', official, desc, tags:['modulo','módulo','integracion','integración','terceros','transmitter','multitransmitter','fibra','vhf']};
  }
  if(n.includes('lineprotect') || n.includes('linesplit') || n.includes('linesupply')){
    let desc = n.includes('lineprotect')?'Módulo Ajax Fibra de protección de línea contra cortocircuito y sabotaje':n.includes('linesplit')?'Módulo Ajax Fibra para dividir una línea en cuatro líneas':'Módulo Ajax Fibra para alimentación adicional de la línea';
    if(n.includes('45w')) desc += ' de 45 W'; if(n.includes('75w')) desc += ' de 75 W';
    return {icon:'🧩', family:'Accesorios Fibra Ajax', official:'Fibra', desc, tags:['fibra','lineprotect','linesplit','linesupply','linea','línea','alimentacion','proteccion']};
  }

  // Carcasas y fuentes.
  if(/^aj-case|case/.test(n)){
    let desc='Carcasa Ajax para módulos y accesorios';
    if(n.includes('casee')) desc='Carcasa impermeable Ajax para hub con batería interna. Para exteriores e interiores';
    return {icon:'📦', family:'Carcasas Ajax', official:'Case', desc, tags:['carcasa','case','caja','modulo','módulo']};
  }
  if(n.includes('psu') || n.includes('pcb')){
    let desc = n.includes('nvr') ? 'Fuente de alimentación Ajax para NVR' : 'Fuente de alimentación Ajax para funcionamiento con alimentación de baja tensión';
    if(n.includes('12v')) desc='Fuente de alimentación Ajax 12 V para Hub, Hub Plus o ReX';
    if(n.includes('6v')) desc='Fuente de alimentación Ajax 6 V para funcionamiento con batería portátil';
    return {icon:'🔋', family:'Fuentes de alimentación Ajax', official:'PSU', desc, tags:['fuente','alimentacion','alimentación','psu','12v','6v','baja tension','batería','bateria']};
  }

  return null;
}
const descripcionProducto_PRE191 = descripcionProducto;
descripcionProducto = function(p){
  // Mantener Curtain y Door del parche 1.9.0 por delante.
  try{ const cur = (typeof curtainDesc190 === 'function') ? curtainDesc190(p) : null; if(cur) return cur; }catch(e){}
  try{ const door = (typeof doorDesc190 === 'function') ? doorDesc190(p) : null; if(door) return door; }catch(e){}
  const m = preciseDesc191(p); if(m) return m;
  return descripcionProducto_PRE191(p);
};
const scoreProducto_PRE191 = scoreProducto;
scoreProducto = function(p,term){
  const q = q187 ? q187(term) : normaliza(term).trim();
  let score = 0;
  try{ score += Math.max(0, scoreProducto_PRE191(p,q)); }catch(e){}
  const m = preciseDesc191(p);
  if(m && q){
    const hay = normaliza([m.desc,m.family,m.official,(m.tags||[]).join(' '),ref191(p)].join(' '));
    for(const t of q.split(/\s+/).filter(Boolean)){ if(hay.includes(t)) score += 8000; }
    if(q.includes('curtain') || q.includes('cortina')){ if(n191(p).includes('curtain')) score += 240000; }
    if(q.includes('wifi') || q.includes('wi fi')){ if(n191(p).includes('indoorcam') || n191(p).includes('hub2plus')) score += 120000; }
    if(q.includes('teclado') || q.includes('keypad')){ if(n191(p).includes('keypad')) score += 100000; }
    if(q.includes('incendio') || q.includes('humo') || q.includes('co') || q.includes('calor')){ if(n191(p).includes('fireprotect')) score += 100000; }
    if(q.includes('camara') || q.includes('cámara') || q.includes('camera')){ if(isCamera191(n191(p))) score += 100000; }
  }
  return score;
};
document.addEventListener('DOMContentLoaded',()=>{
  try{ document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_191}`; }); }catch(e){}
});

/* =====================================================
   PATCH v1.9.2 PRO - Familias Ajax estables
   - Añade una capa de familias/categorías sin reescribir la app.
   - Corrige Dummy como carcasas/maquetas, no dispositivos reales.
   - Refuerza Curtain como familia propia.
   - Potencia intrusión, sirenas, mandos, botones, carcasas y accesorios.
   ===================================================== */
const APP_VERSION_192 = 'v1.9.2 PRO';
function ref192(p){ return String((p && p.name) || '').trim(); }
function n192(p){ return normaliza(ref192(p)); }
function color192(n){
  if(typeof color191 === 'function') return color191(n);
  if(/-w($|-)/.test(n)) return 'Blanco';
  if(/-b($|-)/.test(n)) return 'Negro';
  if(/-gra($|-)/.test(n)) return 'Grafito';
  if(/-gre($|-)/.test(n)) return 'Gris';
  return '';
}
function withColor192(desc,n){ const c=color192(n); return c ? `${desc} ${c}` : desc; }
function isDummy192(n){ return n.includes('dummy'); }
function dummyOfficial192(n){
  if(n.includes('curtainprotect')) return 'CurtainProtect Dummy';
  if(n.includes('dualcurtainoutdoor')) return 'DualCurtain Outdoor Dummy';
  if(n.includes('motioncamoutdoor')) return 'MotionCam Outdoor Dummy';
  if(n.includes('motioncam')) return 'MotionCam Dummy';
  if(n.includes('motionprotect')) return 'MotionProtect Dummy';
  if(n.includes('doorprotect')) return 'DoorProtect Dummy';
  if(n.includes('combiprotect')) return 'CombiProtect Dummy';
  if(n.includes('glassprotect')) return 'GlassProtect Dummy';
  if(n.includes('fireprotect')) return 'FireProtect Dummy';
  if(n.includes('homesiren')) return 'HomeSiren Dummy';
  if(n.includes('streetsirencustom')) return 'StreetSiren Custom Dummy';
  if(n.includes('streetsiren')) return 'StreetSiren Dummy';
  if(n.includes('keypadplus')) return 'KeyPad Plus Dummy';
  if(n.includes('keypadcombi')) return 'KeyPad Combi Dummy';
  if(n.includes('keypad')) return 'KeyPad Dummy';
  if(n.includes('spacecontrol')) return 'SpaceControl Dummy';
  if(n.includes('outdoorprotect')) return 'OutdoorProtect Dummy';
  if(n.includes('hub')) return 'Hub Dummy';
  return 'Dummy Ajax';
}
function familyDesc192(p){
  const raw=ref192(p), n=n192(p);

  // DUMMY SIEMPRE PRIMERO: maqueta/carcasa, nunca detector real.
  if(isDummy192(n)){
    const official=dummyOfficial192(n);
    let base = 'Maqueta/carcasa Ajax sin electrónica funcional para exposición, reposición estética o demostración';
    if(n.includes('curtain')) base = 'Maqueta/carcasa Ajax tipo cortina sin electrónica funcional';
    if(n.includes('siren')) base = 'Carcasa/maqueta Ajax de sirena sin electrónica funcional';
    if(n.includes('hub')) base = 'Carcasa/maqueta Ajax de central Hub sin electrónica funcional';
    return {
      icon:'📦', official, family:'Carcasas y maquetas Ajax · Dummy',
      desc:withColor192(base,n),
      tags:['dummy','maqueta','carcasa','sin electronica','sin electrónica','demo','exposicion','exposición','repuesto estetico','repuesto estético',official.toLowerCase()]
    };
  }

  // Carcasas / maletas / soportes que no son dispositivos de alarma.
  if(n.includes('democase') || n.includes('suitcase') || n.includes('case') || n.includes('brackethub') || n.includes('hood-') || n.includes('-lens') || n.includes('lens')){
    let official='Accesorio Ajax';
    let desc='Accesorio Ajax de instalación o demostración';
    let sub='Accesorios';
    if(n.includes('democase')){ official='DemoCase'; desc='Maletín demostrativo Ajax para exposición y formación'; sub='Maletas demo'; }
    else if(n.includes('suitcase')){ official='Suitcase'; desc='Maleta Ajax para transporte, demo o instalación'; sub='Maletas'; }
    else if(n.includes('brackethub')){ official='BracketHub'; desc='Soporte de montaje Ajax para central Hub'; sub='Soportes'; }
    else if(n.includes('hood')){ official='Hood'; desc='Visera protectora Ajax para detector exterior'; sub='Accesorios detectores'; }
    else if(n.includes('lens')){ official='Lens'; desc='Lente de recambio Ajax para detector'; sub='Recambios'; }
    else if(n.includes('case')){ official='Case'; desc='Carcasa Ajax para módulos, hubs o accesorios'; sub='Carcasas'; }
    return {icon:'🧰', official, family:`Carcasas y accesorios Ajax · ${sub}`, desc:withColor192(desc,n), tags:['accesorio','carcasa','case','maleta','demo','soporte','bracket','hood','lente','lens',official.toLowerCase()]};
  }

  // Intrusión: familias principales.
  if(n.includes('curtain')){
    let official='CurtainProtect', desc='Detector Ajax de movimiento tipo cortina para protección de accesos, pasillos y perímetros', sub='Cortina';
    if(n.includes('curtaincamoutdoor')){ official='CurtainCam Outdoor'; desc='Detector exterior Ajax tipo cortina con cámara y verificación fotográfica'; sub='Cortina exterior con cámara'; }
    else if(n.includes('dualcurtainoutdoor')){ official='DualCurtain Outdoor'; desc='Detector exterior Ajax tipo cortina doble para protección perimetral'; sub='Cortina exterior doble'; }
    else if(n.includes('curtainoutdoor')){ official='Curtain Outdoor'; desc='Detector exterior Ajax tipo cortina para protección perimetral'; sub='Cortina exterior'; }
    return {icon:n.includes('cam')?'📷':'🛡️', official, family:`Intrusión Ajax · Detectores tipo cortina · ${sub}`, desc:withColor192(desc,n), tags:['curtain','cortina','tipo cortina','detector cortina','perimetral','perímetro','pir','movimiento','exterior','interior',official.toLowerCase()]};
  }
  if(n.includes('doorprotect') && !n.includes('outdoorprotect') && !n.includes('doorbell')){
    const plus=n.includes('plus');
    return {icon:'🚪', official:plus?'DoorProtect Plus':'DoorProtect', family:'Intrusión Ajax · Contactos magnéticos', desc:withColor192(plus?'Detector magnético Ajax de apertura con impacto e inclinación para puertas y ventanas':'Detector magnético Ajax de apertura para puertas y ventanas',n), tags:['doorprotect','puerta','ventana','apertura','contacto magnético','magnetico','magnético','iman','imán']};
  }
  if(n.includes('motioncam') || n.includes('motionprotect') || n.includes('outdoorprotect')){
    let official='MotionProtect', desc='Detector volumétrico PIR Ajax de movimiento', sub='Movimiento interior';
    if(n.includes('motioncamoutdoor')){ official='MotionCam Outdoor'; desc='Detector exterior Ajax de movimiento con cámara y verificación fotográfica'; sub='Movimiento exterior con cámara'; }
    else if(n.includes('motioncam')){ official='MotionCam'; desc='Detector volumétrico Ajax de movimiento con cámara y verificación fotográfica'; sub='Movimiento con cámara'; }
    else if(n.includes('outdoorprotect')){ official='OutdoorProtect'; desc='Detector exterior Ajax de movimiento para protección perimetral'; sub='Movimiento exterior'; }
    else if(n.includes('motionprotectplus')){ official='MotionProtect Plus'; desc='Detector volumétrico Ajax PIR con sensor adicional de microondas'; sub='Movimiento interior'; }
    if(n.includes('phod')) desc += ' Photo On Demand';
    if(n.includes('highmount')) desc += ' para montaje alto';
    return {icon:n.includes('cam')?'📷':'🛡️', official, family:`Intrusión Ajax · ${sub}`, desc:withColor192(desc,n), tags:['motion','movimiento','volumetrico','volumétrico','pir','detector','exterior','interior','camara','cámara','phod',official.toLowerCase()]};
  }
  if(n.includes('glassprotect')){
    return {icon:'🪟', official:'GlassProtect', family:'Intrusión Ajax · Rotura de cristal', desc:withColor192('Detector Ajax de rotura de cristal',n), tags:['glassprotect','cristal','rotura','vidrio','detector']};
  }
  if(n.includes('combiprotect')){
    return {icon:'🛡️', official:'CombiProtect', family:'Intrusión Ajax · Movimiento + cristal', desc:withColor192('Detector combinado Ajax de movimiento y rotura de cristal',n), tags:['combiprotect','combi','movimiento','cristal','rotura','pir','detector']};
  }

  // Control, mandos, botones y sirenas.
  if(n.includes('spacecontrol')) return {icon:'🎛️', official:'SpaceControl', family:'Control Ajax · Mandos', desc:withColor192('Mando inalámbrico Ajax SpaceControl para controlar el sistema de alarma',n), tags:['mando','spacecontrol','llavero','control','armar','desarmar','boton','botón']};
  if(n.includes('doublebutton')) return {icon:'🆘', official:'DoubleButton', family:'Control Ajax · Botones de pánico', desc:withColor192('Botón inalámbrico Ajax DoubleButton para alarma de pánico con doble pulsación',n), tags:['doublebutton','boton','botón','panico','pánico','alarma','pulsador']};
  if(n.includes('button') && !n.includes('centerbutton') && !n.includes('sidebutton') && !n.includes('solobutton')) return {icon:'🔘', official:'Button', family:'Control Ajax · Botones', desc:withColor192('Botón inalámbrico Ajax configurable para alarma o escenarios',n), tags:['button','boton','botón','escenario','panico','pánico','control']};
  if(n.includes('homesiren') || n.includes('streetsiren')){
    let official=n.includes('homesiren')?'HomeSiren':(n.includes('custom')?'StreetSiren Custom':'StreetSiren');
    let desc=n.includes('homesiren')?'Sirena interior inalámbrica Ajax':'Sirena exterior inalámbrica Ajax';
    if(n.includes('custom')) desc='Sirena exterior Ajax personalizable';
    return {icon:'📣', official, family:n.includes('homesiren')?'Sirenas Ajax · Interior':'Sirenas Ajax · Exterior', desc:withColor192(desc,n), tags:['sirena','siren','alarma','sonora','interior','exterior',official.toLowerCase()]};
  }

  return null;
}

const descripcionProducto_PRE192 = descripcionProducto;
descripcionProducto = function(p){
  const m=familyDesc192(p); if(m) return m;
  return descripcionProducto_PRE192(p);
};
const scoreProducto_PRE192 = scoreProducto;
scoreProducto = function(p,term){
  const q = q187 ? q187(term) : normaliza(term).trim();
  let score=0;
  try{ score += Math.max(0, scoreProducto_PRE192(p,q)); }catch(e){}
  const n=n192(p), m=familyDesc192(p);
  if(!q) return score;
  if(m){
    const hay=normaliza([m.official,m.family,m.desc,(m.tags||[]).join(' '),ref192(p)].join(' '));
    q.split(/\s+/).filter(Boolean).forEach(t=>{ if(hay.includes(t)) score += 9000; });
  }
  const wantsDummy = q.includes('dummy') || q.includes('maqueta') || q.includes('carcasa') || q.includes('demo');
  if(wantsDummy){ score += isDummy192(n) ? 260000 : -50000; }
  else if(isDummy192(n) && (q.includes('detector') || q.includes('sirena') || q.includes('hub') || q.includes('teclado') || q.includes('motion') || q.includes('door') || q.includes('curtain'))){
    score -= 140000; // no mezclar maquetas con producto real salvo búsqueda explícita
  }
  if(q.includes('cortina') || q.includes('curtain')) score += n.includes('curtain') ? 250000 : -60000;
  if(q.includes('sirena') || q.includes('siren')) score += (n.includes('homesiren') || n.includes('streetsiren')) ? 170000 : 0;
  if(q.includes('mando') || q.includes('spacecontrol') || q.includes('llavero')) score += n.includes('spacecontrol') ? 170000 : 0;
  if(q.includes('pulsador') || q.includes('panico') || q.includes('pánico')) score += (n.includes('button') || n.includes('manualcallpoint')) ? 150000 : 0;
  if(q.includes('detector') && (q.includes('movimiento') || q.includes('pir') || q.includes('volumetrico') || q.includes('volumétrico'))) score += (n.includes('motionprotect') || n.includes('motioncam') || n.includes('outdoorprotect') || n.includes('curtain')) ? 120000 : 0;
  return score;
};

document.addEventListener('DOMContentLoaded',()=>{
  try{ document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_192}`; }); }catch(e){}
});

/* =====================================================
   PATCH v1.9.3 LIGERO - Domo/Turret + A-Z catálogo
   Base conservadora sobre el código que mejor funcionaba.
   - No reescribe la app ni el PDF.
   - Domo encuentra DomeCam + TurretCam sin tocar domótica.
   - Turret encuentra solo TurretCam.
   - Bullet/Bala encuentra solo BulletCam.
   - Añade filtro A-Z en catálogo; en referencias AJ- usa la letra tras AJ-.
   ===================================================== */
const APP_VERSION_193 = 'v1.9.3 PRO';
let catalogLetter193 = '';

function norm193(s){
  return normaliza(String(s || '')).replace(/[^a-z0-9]+/g, ' ').trim();
}
function tokens193(s){
  return norm193(s).split(/\s+/).filter(Boolean);
}
function ref193(p){ return String((p && p.name) || '').trim(); }
function n193(p){ return norm193(ref193(p)); }
function hasTok193(term, word){ return tokens193(term).includes(word); }
function isAjaxRef193(name){ return /^AJ-/i.test(String(name || '').trim()); }
function catalogLetterOf193(p){
  let r = ref193(p).toUpperCase().trim();
  if(r.startsWith('AJ-')) r = r.slice(3);
  const m = r.match(/[A-ZÑ]/);
  return m ? m[0] : '#';
}
function setCatalogLetter193(letter){
  catalogLetter193 = letter || '';
  document.querySelectorAll('.az-chip').forEach(b => b.classList.toggle('active', b.dataset.letter === catalogLetter193));
  pintarCatalogPanel($('#catalogFilter')?.value || catalogTerm || '');
}
function ensureAlphabet193(){
  const modal = $('#catalogModal');
  const row = modal ? modal.querySelector('.modal-search-row') : null;
  if(!row || document.getElementById('catalogAZ')) return;
  const az = document.createElement('div');
  az.id = 'catalogAZ';
  az.className = 'catalog-az';
  const letters = ['','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','#'];
  az.innerHTML = letters.map(l => `<button type="button" class="az-chip${l===''?' active':''}" data-letter="${l}">${l || 'Todos'}</button>`).join('');
  row.insertAdjacentElement('afterend', az);
  az.addEventListener('click', e => {
    const btn = e.target.closest('.az-chip');
    if(!btn) return;
    setCatalogLetter193(btn.dataset.letter || '');
  });
}

const buscar_PRE193 = buscar;
function busquedaIntencion193(term){
  const tks = tokens193(term);
  const exact = (w) => tks.includes(w);
  let predicate = null;
  let strong = false;

  // Coincidencias por palabra completa para evitar domo dentro de domótica.
  if(exact('domo') || exact('dome')){
    predicate = p => { const n=n193(p); return n.includes('domecam') || n.includes('turretcam'); };
    strong = true;
  }else if(exact('turret')){
    predicate = p => n193(p).includes('turretcam');
    strong = true;
  }else if(exact('bullet') || exact('bala')){
    predicate = p => n193(p).includes('bulletcam');
    strong = true;
  }else if(exact('street')){
    predicate = p => n193(p).includes('streetsiren');
    strong = true;
  }else if(exact('homesiren')){
    predicate = p => n193(p).includes('homesiren');
    strong = true;
  }else if(exact('fotosensor') || (exact('foto') && exact('detector')) || exact('fotodetector') || exact('fotoverificacion') || exact('fotoverificacion') || exact('phod')){
    predicate = p => { const n=n193(p); return n.includes('motioncam') || n.includes('curtaincam') || n.includes('phod'); };
    strong = true;
  }

  if(!predicate) return null;
  const rows = productos
    .map((p,i)=>({p,i,score:scoreProducto(p, term)}))
    .filter(x => predicate(x.p))
    .map(x => ({...x, score: Math.max(x.score, 1000000)}))
    .sort((a,b)=>b.score-a.score || a.p.name.localeCompare(b.p.name,'es'));
  return strong ? rows : null;
}

buscar = function(term){
  const q = String(term || '').trim();
  if(!q) return [];
  const forced = busquedaIntencion193(q);
  if(forced) return forced.slice(0,300);
  return buscar_PRE193(q);
};

buscarCatalogo = function(term=''){
  const q = String(term || '').trim();
  let lista;
  if(q){
    const forced = busquedaIntencion193(q);
    lista = forced || buscar(q);
  }else{
    lista = productos.map((p,i)=>({p,i,score:1})).sort((a,b)=>a.p.name.localeCompare(b.p.name,'es'));
  }
  if(catalogLetter193){
    lista = lista.filter(x => catalogLetterOf193(x.p) === catalogLetter193);
  }
  return lista;
};

const pintarCatalogPanel_PRE193 = pintarCatalogPanel;
pintarCatalogPanel = function(term=catalogTerm){
  ensureAlphabet193();
  pintarCatalogPanel_PRE193(term);
};

// Pequeños refuerzos de puntuación sin filtrar de forma agresiva.
const scoreProducto_PRE193 = scoreProducto;
scoreProducto = function(p, term){
  let score = 0;
  try{ score = scoreProducto_PRE193(p, term); }catch(e){}
  const q = norm193(term), n = n193(p);
  if(!q) return score;
  const tks = tokens193(q);
  if(tks.includes('domo') || tks.includes('dome')){
    if(n.includes('domecam')) score += 250000;
    if(n.includes('turretcam')) score += 180000;
    if(n.includes('domotica')) score -= 500000;
  }
  if(tks.includes('turret')) score += n.includes('turretcam') ? 260000 : -100000;
  if(tks.includes('bullet') || tks.includes('bala')) score += n.includes('bulletcam') ? 260000 : -100000;
  if(tks.includes('street')) score += n.includes('streetsiren') ? 260000 : -120000;
  if(tks.includes('homesiren')) score += n.includes('homesiren') ? 260000 : -120000;
  if(tks.includes('fotosensor') || tks.includes('fotodetector') || (tks.includes('foto') && tks.includes('detector'))) score += (n.includes('motioncam') || n.includes('curtaincam') || n.includes('phod')) ? 240000 : -80000;
  return score;
};

// Reinicia A-Z al abrir catálogo desde botón para que no parezca que faltan productos.
const abrirCatalogo_PRE193 = typeof abrirCatalogo === 'function' ? abrirCatalogo : null;
if(abrirCatalogo_PRE193){
  abrirCatalogo = function(){
    catalogLetter193 = '';
    ensureAlphabet193();
    document.querySelectorAll('.az-chip').forEach(b => b.classList.toggle('active', b.dataset.letter === ''));
    return abrirCatalogo_PRE193.apply(this, arguments);
  };
}

document.addEventListener('DOMContentLoaded',()=>{
  try{
    ensureAlphabet193();
    document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_193}`; });
  }catch(e){}
});


/* =====================================================
   PATCH v1.9.4 PRO - Ajustes seguros + búsqueda más ágil
   Base: v1.9.3 PRO.
   - Mantiene A-Z, domo/turret/bullet/street.
   - Tienda sin seleccionar por defecto se aplica desde HTML.
   - Cache de búsquedas para evitar recalcular dos veces.
   - Resolver de búsqueda con pequeño debounce conservador.
   ===================================================== */
const APP_VERSION_194 = 'v1.9.4 PRO';
const SEARCH_CACHE_194 = new Map();
const CATALOG_CACHE_194 = new Map();
function key194(term){ return norm193(String(term || '')).slice(0, 120); }

const buscar_BASE194 = buscar;
buscar = function(term){
  const raw = String(term || '');
  if(!raw.trim()) return [];
  const k = key194(raw) + '|' + (productos ? productos.length : 0);
  if(SEARCH_CACHE_194.has(k)) return SEARCH_CACHE_194.get(k);
  const out = buscar_BASE194(raw);
  if(SEARCH_CACHE_194.size > 120) SEARCH_CACHE_194.clear();
  SEARCH_CACHE_194.set(k, out);
  return out;
};

const buscarCatalogo_BASE194 = buscarCatalogo;
buscarCatalogo = function(term=''){
  const raw = String(term || '');
  const k = key194(raw) + '|' + (catalogLetter193 || '') + '|' + (productos ? productos.length : 0);
  if(CATALOG_CACHE_194.has(k)) return CATALOG_CACHE_194.get(k);
  const out = buscarCatalogo_BASE194(raw);
  if(CATALOG_CACHE_194.size > 80) CATALOG_CACHE_194.clear();
  CATALOG_CACHE_194.set(k, out);
  return out;
};

const resolverDesdeInput_BASE194 = resolverDesdeInput;
let searchTimer194 = null;
resolverDesdeInput = function(){
  clearTimeout(searchTimer194);
  const input = $('#buscador');
  const term = input ? input.value : '';
  seleccionado = null;
  const sel = $('#producto'); if(sel) sel.value = '';
  searchTimer194 = setTimeout(()=>{
    pintarResultados(term);
    const best = buscar(term)[0];
    if(best){
      const d = descripcionProducto(best.p);
      $('#previewProducto').innerHTML = `<b>${escapeHtml(d.icon)} ${escapeHtml(best.p.name)}</b> · ${escapeHtml(d.desc)} · ${fmt.format(best.p.pvp)}`;
    }else{
      $('#previewProducto').textContent='Selecciona un producto para ver su precio.';
    }
  }, 55);
};

// Limpia caches al recargar catálogo y mantiene versión visible simple.
const cargarCatalogo_BASE194 = cargarCatalogo;
cargarCatalogo = async function(){
  SEARCH_CACHE_194.clear();
  CATALOG_CACHE_194.clear();
  return cargarCatalogo_BASE194.apply(this, arguments);
};

document.addEventListener('DOMContentLoaded',()=>{
  try{
    document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_194}`; });
  }catch(e){}
});

/* =====================================================
   PATCH v1.9.6 PRO - Numeración de presupuestos segura
   - No sobrescribe un presupuesto guardado por reutilizar el mismo número.
   - Al guardar uno nuevo, si el número ya existe, asigna automáticamente el siguiente.
   - Al recuperar un presupuesto y guardar, sí actualiza ese mismo presupuesto.
   ===================================================== */
const APP_VERSION_196 = 'v1.9.6 PRO';

function parseNumeroHA196(num){
  const m = String(num || '').trim().match(/^HA-(\d{4})-(\d+)$/i);
  if(!m) return null;
  return {year:Number(m[1]), n:Number(m[2])};
}
function maxNumeroGuardado196(year){
  return leerListaPresupuestos().reduce((max,p)=>{
    const info = parseNumeroHA196(p && p.numero);
    return info && info.year === year ? Math.max(max, info.n) : max;
  }, 0);
}
function avanzarContadorSiHaceFalta196(numero){
  const info = parseNumeroHA196(numero);
  if(!info) return;
  let data = leerJSON(STORAGE_CONTADOR, {year:info.year, n:1});
  if(data.year !== info.year) data = {year:info.year, n:1};
  if(Number(data.n || 1) <= info.n){
    data.n = info.n + 1;
    escribirJSON(STORAGE_CONTADOR, data);
  }
}

// Sustituye la numeración base por una que mira también los presupuestos guardados.
siguienteNumero = function(soloVer=false){
  const year = new Date().getFullYear();
  let data = leerJSON(STORAGE_CONTADOR, {year, n:1});
  if(data.year !== year) data = {year, n:1};
  const n = Math.max(Number(data.n || 1), maxNumeroGuardado196(year) + 1);
  const numero = `HA-${year}-${String(n).padStart(4,'0')}`;
  if(!soloVer){
    data = {year, n:n+1};
    escribirJSON(STORAGE_CONTADOR, data);
  }
  return numero;
};

const nuevoPresupuesto_BASE196 = nuevoPresupuesto;
nuevoPresupuesto = function(){
  nuevoPresupuesto_BASE196.apply(this, arguments);
  const saved = $('#presupuestosGuardados');
  if(saved) saved.value = '';
};

// Guardado seguro: nuevo = número único; recuperado = actualiza el recuperado.
guardar = function(){
  if(!Array.isArray(lineas) || lineas.length === 0){
    alert('Añade al menos un producto antes de guardar el presupuesto.');
    return;
  }

  let lista = leerListaPresupuestos();
  const savedSelect = $('#presupuestosGuardados');
  const selectedId = savedSelect ? String(savedSelect.value || '') : '';
  const selectedIdx = selectedId ? lista.findIndex(p => String(p.id) === selectedId) : -1;

  const data = datosPresupuesto();
  let numero = String(data.numero || '').trim();

  if(selectedIdx >= 0){
    // Estamos editando un presupuesto recuperado: se actualiza ese mismo.
    const duplicado = numero && lista.some((p,i)=>i !== selectedIdx && String(p.numero || '').trim() === numero);
    if(!numero || duplicado){
      numero = siguienteNumero(false);
      data.numero = numero;
      const inputNumero = $('#numero');
      if(inputNumero) inputNumero.value = numero;
    }else{
      avanzarContadorSiHaceFalta196(numero);
    }
    data.id = lista[selectedIdx].id;
    lista[selectedIdx] = data;
  }else{
    // Presupuesto nuevo: si el número ya existe, se asigna el siguiente automáticamente.
    const existe = numero && lista.some(p => String(p.numero || '').trim() === numero);
    if(!numero || existe){
      numero = siguienteNumero(false);
      data.numero = numero;
      const inputNumero = $('#numero');
      if(inputNumero) inputNumero.value = numero;
    }else{
      avanzarContadorSiHaceFalta196(numero);
    }
    data.id = Date.now().toString();
    data.guardado = new Date().toISOString();
    lista.unshift(data);
  }

  escribirListaPresupuestos(lista.slice(0,100));
  refrescarPresupuestosGuardados();
  if(savedSelect) savedSelect.value = data.id;
  alert(`Presupuesto guardado con número ${data.numero}.`);
};

// Duplicar siempre crea presupuesto nuevo, nunca pisa el original seleccionado.
duplicarPresupuesto = function(){
  if(!Array.isArray(lineas) || lineas.length === 0){
    alert('Añade al menos un producto antes de duplicar el presupuesto.');
    return;
  }
  const actual = datosPresupuesto();
  actual.id = Date.now().toString();
  actual.numero = siguienteNumero(false);
  actual.estado = 'Borrador';
  actual.fecha = new Date().toISOString().slice(0,10);
  actual.guardado = new Date().toISOString();
  const saved = $('#presupuestosGuardados');
  if(saved) saved.value = '';
  aplicarPresupuesto(actual);
  guardar();
};

document.addEventListener('DOMContentLoaded',()=>{
  try{
    document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_196}`; });
    const num = $('#numero');
    if(num && !String(num.value || '').trim()) num.value = siguienteNumero(true);
  }catch(e){}
});

/* =====================================================
   PATCH v1.9.7 PRO - Búsqueda exterior = Outdoor
   - Cambio pequeño y seguro sobre v1.9.6.
   - Si se escribe exterior/intemperie/perimetral, prioriza referencias Outdoor.
   ===================================================== */
const APP_VERSION_197 = 'v1.9.7 PRO';

const busquedaForzada_BASE197 = busquedaForzada;
busquedaForzada = function(term){
  const t = normaliza(term).trim();
  if(['exterior','exteriores','outdoor','intemperie','perimetral'].includes(t)){
    return productos
      .map((p,i)=>({p,i,n:normaliza(p.name)}))
      .filter(x => x.n.includes('outdoor'))
      .map(x=>({p:x.p,i:x.i,score:9999}))
      .sort((a,b)=>a.p.name.localeCompare(b.p.name,'es'));
  }
  return busquedaForzada_BASE197.apply(this, arguments);
};

document.addEventListener('DOMContentLoaded',()=>{
  try{
    document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_197}`; });
  }catch(e){}
});

/* =====================================================
   PATCH v1.9.8 PRO - Cámaras + búsqueda presupuestos
   - Bullet/Dome/Turret: lente 4 mm si referencia contiene 0400.
   - Bullet/Dome/Turret: lente fija 2,8 mm si no contiene 0400 ni VF/HLVF.
   - VF/HLVF: objetivo varifocal 2,8–12 mm.
   - Buscador de presupuestos guardados por nº, cliente, fecha, tienda o estado.
   - Pequeños alias seguros para cámaras: 4mm, 2.8, varifocal, vf.
   ===================================================== */
const APP_VERSION_198 = 'v1.9.8 PRO';

function camaraDesc198(p, base){
  const n = normaliza((p && p.name) || '');
  if(!(n.includes('bulletcam') || n.includes('domecam') || n.includes('turretcam'))) return null;
  let tipo = n.includes('bulletcam') ? 'bullet' : (n.includes('domecam') ? 'domo' : 'turret/torreta');
  const mp = n.includes('-8-') || n.includes('cam-8') ? '8 Mp' : (n.includes('-4-') || n.includes('cam-4') ? '4 Mp' : (n.includes('-5-') || n.includes('cam-5') ? '5 Mp' : ''));
  const hl = n.includes('hlvf') || n.includes('-hl-') || n.includes('hl-') ? ' con iluminación híbrida' : '';
  let lente = '';
  if(n.includes('hlvf') || n.includes('-vf') || n.includes('vf-')) lente = 'objetivo varifocal 2,8–12 mm';
  else if(n.includes('0400')) lente = 'lente fija de 4 mm';
  else lente = 'lente fija de 2,8 mm';
  const mpTxt = mp ? ` ${mp}` : '';
  return {icon:'📷', desc:`Cámara IP Ajax tipo ${tipo}${mpTxt} con ${lente}${hl}, IA, True WDR y PoE/12 V`, family:(base&&base.family)||'Cámaras'};
}

const descripcionProducto_BASE198 = descripcionProducto;
descripcionProducto = function(p){
  const base = descripcionProducto_BASE198.apply(this, arguments);
  const cam = camaraDesc198(p, base);
  return cam || base;
};

const scoreProducto_BASE198 = scoreProducto;
scoreProducto = function(p, term){
  let score = 0;
  try{ score = scoreProducto_BASE198(p, term); }catch(e){}
  const q = normaliza(term).trim();
  const n = normaliza((p && p.name) || '');
  if(!q) return score;
  const isCam = n.includes('bulletcam') || n.includes('domecam') || n.includes('turretcam');
  if(isCam){
    if(['4mm','4 mm','lente 4','lente 4mm'].includes(q)) score += n.includes('0400') ? 220000 : -60000;
    if(['2.8','2,8','2.8mm','2,8mm','2.8 mm','2,8 mm'].includes(q)) score += (!n.includes('0400') && !n.includes('hlvf') && !n.includes('-vf') && !n.includes('vf-')) ? 220000 : -60000;
    if(['vf','varifocal','varifocales'].includes(q)) score += (n.includes('hlvf') || n.includes('-vf') || n.includes('vf-')) ? 220000 : -60000;
  }
  return score;
};

function presupuestoTexto198(p){
  return normaliza([
    p && p.numero,
    p && p.cliente,
    p && p.telefono,
    p && p.email,
    p && p.fecha,
    p && p.estado,
    p && p.tienda,
    (p && Array.isArray(p.lineas)) ? p.lineas.map(l=>l.name).join(' ') : ''
  ].join(' '));
}
function ensureBudgetSearch198(){
  const sel = $('#presupuestosGuardados');
  if(!sel) return;
  let input = $('#buscarPresupuestoGuardado');
  if(!input){
    input = document.createElement('input');
    input.id = 'buscarPresupuestoGuardado';
    input.className = 'saved-search-input saved-search';
    input.placeholder = 'Buscar presupuesto...';
    input.autocomplete = 'off';
    input.title = 'Buscar por número, cliente, teléfono, fecha, tienda o producto';
    sel.parentNode.insertBefore(input, sel);
  }
  if(!input.dataset.searchBound){
    input.addEventListener('input',()=>refrescarPresupuestosGuardados());
    input.dataset.searchBound = '1';
  }
}

const refrescarPresupuestosGuardados_BASE198 = refrescarPresupuestosGuardados;
refrescarPresupuestosGuardados = function(){
  ensureBudgetSearch198();
  const sel = $('#presupuestosGuardados');
  if(!sel) return refrescarPresupuestosGuardados_BASE198.apply(this, arguments);
  const selected = sel.value;
  const q = normaliza($('#buscarPresupuestoGuardado')?.value || '').trim();
  let lista = leerListaPresupuestos().sort((a,b)=>String(b.guardado||'').localeCompare(String(a.guardado||'')));
  if(q){
    const parts = q.split(/\s+/).filter(Boolean);
    lista = lista.filter(p => parts.every(part => presupuestoTexto198(p).includes(part)));
  }
  sel.innerHTML = '<option value="">' + (q ? `Resultados: ${lista.length}` : 'Presupuestos guardados') + '</option>' + lista.map(p=>{
    const nombre = [p.numero || 'Sin número', p.cliente || 'Sin cliente', p.fecha || '', p.estado || ''].filter(Boolean).join(' · ');
    return `<option value="${escapeHtml(p.id)}">${escapeHtml(nombre)}</option>`;
  }).join('');
  if(selected && lista.some(p=>String(p.id)===String(selected))) sel.value = selected;
};

document.addEventListener('DOMContentLoaded',()=>{
  try{
    ensureBudgetSearch198();
    refrescarPresupuestosGuardados();
    document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_198}`; });
  }catch(e){}
});

/* =====================================================
   PATCH v1.9.9 PRO - Búsqueda rápida segura
   - Arregla A-Z en modo claro vía CSS.
   - Añade abreviaturas profesionales exactas.
   - Resultados con segunda línea más útil sin cambiar el motor general.
   ===================================================== */
const APP_VERSION_199 = 'v2.0.1 PRO Limpia';

function ref199(p){ return normaliza((p && p.name) || ''); }
function contiene199(n, arr){ return arr.some(k => n.includes(k)); }

function resultadoForzado199(term){
  const q = normaliza(term).trim().replace(/\s+/g,'');
  const rules = {
    // Centrales
    'h2p': n => n.includes('hub2plus'),
    'h2plus': n => n.includes('hub2plus'),
    'h2': n => n.includes('hub2') && !n.includes('hub2plus') && !n.includes('hub2kit'),
    'h24g': n => n.includes('hub2') && n.includes('4g') && !n.includes('kit'),
    'hbp': n => n.includes('hubbp'),
    'bp': n => n.includes('hubbp'),
    'kit': n => n.includes('kit') && (n.includes('hub') || n.includes('starter')),
    'hubkit': n => n.includes('hubkit') || n.includes('hub2kit'),

    // Intrusión
    'mp': n => n.includes('motionprotect') && !n.includes('motioncam'),
    'mpp': n => n.includes('motionprotectplus'),
    'mc': n => n.includes('motioncam'),
    'mco': n => n.includes('motioncamoutdoor') || n.includes('curtaincamoutdoor'),
    'phod': n => n.includes('phod'),
    'dp': n => n.includes('doorprotect') && !n.includes('doorprotectplus'),
    'dpp': n => n.includes('doorprotectplus'),
    'gp': n => n.includes('glassprotect'),
    'cp': n => n.includes('combiprotect'),
    'cur': n => n.includes('curtain'),

    // Incendio / agua / aire
    'fp': n => n.includes('fireprotect'),
    'fp2': n => n.includes('fireprotect2'),
    'lq': n => n.includes('lifequality'),
    'lp': n => n.includes('leaksprotect'),
    'ws': n => n.includes('waterstop'),

    // Sirenas / mandos / teclados
    'ss': n => n.includes('streetsiren'),
    'hs': n => n.includes('homesiren'),
    'kp': n => n.includes('keypad'),
    'kpt': n => n.includes('keypadtouchscreen'),
    'sc': n => n.includes('spacecontrol'),
    'db': n => n.includes('doublebutton') || n.includes('doorbell'),

    // Vídeo
    'bc': n => n.includes('bulletcam'),
    'bc5': n => n.includes('bulletcam') && n.includes('-5'),
    'bc8': n => n.includes('bulletcam') && n.includes('-8'),
    'dc': n => n.includes('domecam'),
    'dc5': n => n.includes('domecam') && n.includes('-5'),
    'dc8': n => n.includes('domecam') && n.includes('-8'),
    'tc': n => n.includes('turretcam'),
    'tc5': n => n.includes('turretcam') && n.includes('-5'),
    'tc8': n => n.includes('turretcam') && n.includes('-8'),
    'ic': n => n.includes('indoorcam'),
    'nvr8': n => n.includes('nvr108') || n.includes('nvr208') || n.includes('8-ch') || n.includes('8p'),
    'nvr16': n => n.includes('nvr116') || n.includes('nvr216') || n.includes('16-ch') || n.includes('16p'),
    'nvr32': n => n.includes('nvr232') || n.includes('32-ch'),

    // Domótica / módulos
    'rl': n => n.includes('relay') || n.includes('wallswitch') || n.includes('multirelay'),
    'sw': n => n.includes('switch') || n.includes('lightcore') || n.includes('button') || n.includes('cover'),
    'sk': n => n.includes('socket'),
    'psu': n => n.includes('psu') || n.includes('pcb') || n.includes('dc12') || n.includes('ac220'),
    'rex': n => n.includes('rex')
  };
  const rule = rules[q];
  if(!rule) return null;
  return productos
    .map((p,i)=>({p,i,n:ref199(p)}))
    .filter(x => rule(x.n))
    .map(x=>({p:x.p,i:x.i,score:999999}))
    .sort((a,b)=>a.p.name.localeCompare(b.p.name,'es'));
}

const busquedaForzada_BASE199 = busquedaForzada;
busquedaForzada = function(term){
  const forced = resultadoForzado199(term);
  if(forced) return forced;
  return busquedaForzada_BASE199.apply(this, arguments);
};

function resumenProducto199(p){
  const n = ref199(p);
  const tags = [];
  if(n.includes('hub2plus')) tags.push('Hub 2 Plus', 'Wi-Fi', 'Ethernet', '2 SIM');
  else if(n.includes('hub2') && n.includes('4g')) tags.push('Hub 2', '4G/LTE', '2 SIM');
  else if(n.includes('hubbp')) tags.push('Hub BP', 'batería', '4G/LTE');
  else if(n.includes('hub') && !n.includes('bracket') && !n.includes('battery')) tags.push('Central Ajax');
  if(n.includes('kit')) tags.push('kit');

  if(n.includes('motioncam')) tags.push('movimiento con cámara');
  else if(n.includes('motionprotect')) tags.push('movimiento PIR');
  if(n.includes('phod')) tags.push('PhOD / fotoverificación');
  if(n.includes('doorprotect')) tags.push('apertura puerta/ventana');
  if(n.includes('curtain')) tags.push('tipo cortina');
  if(n.includes('glassprotect')) tags.push('rotura cristal');
  if(n.includes('fireprotect')) tags.push('incendio');
  if(n.includes('streetsiren')) tags.push('sirena exterior');
  if(n.includes('homesiren')) tags.push('sirena interior');
  if(n.includes('keypad')) tags.push('teclado');
  if(n.includes('spacecontrol')) tags.push('mando');
  if(n.includes('waterstop')) tags.push('válvula agua');
  if(n.includes('leaksprotect')) tags.push('inundación');

  if(n.includes('bulletcam')) tags.push('BulletCam');
  if(n.includes('domecam')) tags.push('DomeCam');
  if(n.includes('turretcam')) tags.push('TurretCam');
  if(n.includes('indoorcam')) tags.push('Wi-Fi interior');
  if(n.includes('nvr')) tags.push('NVR');
  if(n.includes('hlvf') || n.includes('-vf') || n.includes('vf-')) tags.push('varifocal 2,8–12 mm');
  else if((n.includes('bulletcam') || n.includes('domecam') || n.includes('turretcam')) && n.includes('0400')) tags.push('4 mm');
  else if(n.includes('bulletcam') || n.includes('domecam') || n.includes('turretcam')) tags.push('2,8 mm');
  if(n.includes('-8-') || n.includes('cam-8')) tags.push('8 MP');
  if(n.includes('-5-') || n.includes('cam-5')) tags.push('5 MP');
  if(n.includes('-4-') || n.includes('cam-4')) tags.push('4 MP');

  if(n.endsWith('-w') || n.includes('-w-')) tags.push('blanco');
  if(n.endsWith('-b') || n.includes('-b-')) tags.push('negro');
  return [...new Set(tags)].slice(0,5).join(' · ');
}

const pintarResultados_BASE199 = pintarResultados;
pintarResultados = function(term){
  const panel = $('#resultados');
  const results = buscar(term);
  activeIndex = -1;
  if(!term.trim() || !results.length){
    panel.classList.add('hidden');
    panel.innerHTML='';
    panel.dataset.firstIndex='';
    return;
  }
  panel.dataset.firstIndex = String(results[0].i);
  panel.innerHTML = results.slice(0, 80).map((x,k)=>{
    const d = descripcionProducto(x.p);
    const extra = resumenProducto199(x.p);
    const meta = extra ? `${extra} · ${d.desc}` : d.desc;
    return `<div class="result-item result-item-pro" data-index="${x.i}" data-k="${k}"><div><div class="result-name">${escapeHtml(d.icon)} ${escapeHtml(x.p.name)}</div><div class="result-meta">${escapeHtml(meta)}</div></div><div class="result-price">${fmt.format(x.p.pvp)}</div></div>`;
  }).join('');
  // Cada consulta nueva empieza arriba; no mueve el scroll de la página.
  panel.scrollTop = 0;
  panel.querySelectorAll('.result-item').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ activeIndex = Number(el.dataset.k); marcarActivo(); });
    el.addEventListener('click',()=> seleccionarProducto(Number(el.dataset.index), true));
    el.addEventListener('dblclick',()=>{ seleccionarProducto(Number(el.dataset.index), true); addLinea(); });
  });
  panel.classList.remove('hidden');
};

document.addEventListener('DOMContentLoaded',()=>{
  try{
    document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_199}`; });
  }catch(e){}
});

/* =====================================================
   PATCH v2.0.3 PRO - Corrección segura Hubs / fuentes
   - Evita que AJ-HUB-W / AJ-HUB2... tomen descripción de PSU.
   - BracketHub queda como soporte/accesorio.
   - Solo PSU/PCB/DC/AC se describen como fuente de alimentación.
   ===================================================== */
const APP_VERSION_203 = 'v2.0.3 PRO';
function ref203(p){ return normaliza((p && p.name) || ''); }
function color203(n){
  if(/-w(\b|-|$)/.test(n)) return ' Blanco';
  if(/-b(\b|-|$)/.test(n)) return ' Negro';
  return '';
}
function descHubSeguro203(p){
  const n = ref203(p);
  if(!n) return null;

  // Accesorios de hub: nunca describir como central.
  if(n.includes('brackethub')){
    return {icon:'🧩', family:'Accesorios Ajax', official:'BracketHub', desc:'Soporte de montaje Ajax para Hub'+color203(n)};
  }
  if(n.includes('repairkithub')){
    return {icon:'🧩', family:'Accesorios Ajax', official:'RepairKitHub', desc:'Kit de reparación Ajax para Hub'+color203(n)};
  }
  if(n.includes('hubbatt') || n.includes('internalbattery')){
    return {icon:'🔋', family:'Baterías Ajax', official:'Batería Hub', desc:'Batería de repuesto Ajax para Hub'};
  }
  if(n.includes('hub') && n.includes('dummy')){
    return {icon:'📦', family:'Maquetas Ajax', official:'Hub Dummy', desc:'Carcasa/maqueta Ajax Hub sin electrónica'+color203(n)};
  }
  if(n.includes('minihub')){
    return {icon:'🧩', family:'Accesorios Ajax', official:'MiniHub', desc:'Accesorio Ajax MiniHub'+color203(n)};
  }

  // Kits con Hub: no son una central suelta.
  if(n.includes('hub2kit') || n.includes('hubkit') || n.includes('starterkit')){
    let hub = n.includes('hub2kit') ? 'Hub 2' : (n.includes('starterkitplus') ? 'Hub 2 Plus' : 'Hub');
    if(n.includes('4g')) hub += ' 4G';
    let partes = [];
    if(n.includes('mp')) partes.push('MotionProtect');
    if(n.includes('dp')) partes.push('DoorProtect');
    if(n.includes('phod')) partes.push('detectores con fotoverificación PhOD');
    if(n.includes('pro')) partes.push('accesorios profesionales');
    const extra = partes.length ? ' con '+partes.join(', ') : ' con accesorios de alarma';
    return {icon:'📦', family:'Kits Ajax', official:'HubKit', desc:`Kit de alarma Ajax ${hub}${extra}${color203(n)}`};
  }

  // Centrales Hub reales.
  if(/^aj-hub2plus/.test(n)){
    return {icon:'🏠', family:'Hubs Ajax', official:'Hub 2 Plus', desc:'Central de alarma profesional Ajax Hub 2 Plus - Grado 2. Admite Wi-Fi, Ethernet y dos tarjetas SIM (2G/3G/LTE)'+color203(n)};
  }
  if(/^aj-hub2-4g/.test(n)){
    return {icon:'🏠', family:'Hubs Ajax', official:'Hub 2 4G', desc:'Central de alarma profesional Ajax Hub 2 4G - Grado 2 con fotoverificación. Admite Ethernet y dos tarjetas SIM (2G/3G/LTE)'+color203(n)};
  }
  if(/^aj-hub2/.test(n)){
    return {icon:'🏠', family:'Hubs Ajax', official:'Hub 2', desc:'Central de alarma profesional Ajax Hub 2 - Grado 2 con fotoverificación. Admite Ethernet y dos tarjetas SIM (2G)'+color203(n)};
  }
  if(/^aj-hubbp/.test(n)){
    return {icon:'🏠', family:'Hubs Ajax', official:'Hub BP', desc:'Central de alarma profesional Ajax Hub BP alimentada por batería. Admite fotoverificación y dos tarjetas SIM (2G/3G/LTE)'+color203(n)};
  }
  if(/^aj-hub(?:-|$)/.test(n)){
    return {icon:'🏠', family:'Hubs Ajax', official:'Hub', desc:'Central de alarma profesional Ajax - Grado 2. Admite Ethernet y una tarjeta SIM (2G)'+color203(n)};
  }
  return null;
}

const descripcionProducto_BASE203 = descripcionProducto;
descripcionProducto = function(p){
  const hub = descHubSeguro203(p);
  if(hub) return hub;
  return descripcionProducto_BASE203.apply(this, arguments);
};

const scoreProducto_BASE203 = scoreProducto;
scoreProducto = function(p, term){
  let score = 0;
  try{ score = scoreProducto_BASE203.apply(this, arguments); }catch(e){}
  const q = normaliza(term || '').trim();
  const n = ref203(p);
  if(!q) return score;
  const hub = descHubSeguro203(p);
  if(hub){
    const hay = normaliza([n, hub.desc, hub.family, hub.official].join(' '));
    for(const t of q.split(/\s+/).filter(Boolean)) if(hay.includes(t)) score += 50000;
    if((q === 'fuente' || q === 'psu' || q.includes('alimentacion')) && /^aj-hub(?:2|bp|-|$)/.test(n) && !n.includes('batt')) score -= 300000;
  }
  return score;
};

document.addEventListener('DOMContentLoaded',()=>{
  try{ document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_203}`; }); }catch(e){}
});


/* =====================================================
   PATCH v2.0.4 PRO - Acciones rápidas en catálogo
   - Panel compacto de filtros dentro del catálogo.
   - No toca descripciones ni motor principal.
   - En modo claro queda visible qué filtro está seleccionado.
   ===================================================== */
const APP_VERSION_205 = 'v2.0.5 PRO';
let catalogQuick204 = '';

const QUICK_CATALOG_204 = [
  {id:'cam', label:'📷 Cámaras', test:n=>/bulletcam|domecam|turretcam|indoorcam|doorbell/.test(n)},
  {id:'hub', label:'🏠 Hubs', test:n=>/^aj-hub/.test(n) && !/bracket|batt|battery|dummy|repair|kit/.test(n)},
  {id:'det', label:'🚨 Detectores', test:n=>/motionprotect|motioncam|doorprotect|glassprotect|combiprotect|curtain|outdoorprotect|fireprotect|leaksprotect|lifequality|seismoprotect/.test(n) && !/dummy|lens|bracket/.test(n)},
  {id:'sir', label:'📢 Sirenas', test:n=>/homesiren|streetsiren|speakerss/.test(n) && !/dummy|bracket/.test(n)},
  {id:'key', label:'⌨️ Teclados', test:n=>/keypad/.test(n) && !/dummy|bracket/.test(n)},
  {id:'dom', label:'💡 Domótica', test:n=>/lightcore|lightswitch|centerbutton|sidebutton|solobutton|centercove?r|sidecove?r|solocove?r|coverplate|outletcore|outletbasic|outletlan|socket|wallswitch|relay|multirelay|bypass|frame|surfacebox/.test(n)},
  {id:'nvr', label:'🎥 NVR', test:n=>/nvr/.test(n)},
  {id:'sup', label:'🧩 Soportes', test:n=>/junctionbox/.test(n)},
  {id:'out', label:'🌦️ Exterior', test:n=>/outdoor|street|doorbell|waterstop|curtainoutdoor/.test(n)},
  {id:'fire', label:'🔥 Incendio', test:n=>/fireprotect|manualcallpoint|en54/.test(n)},
  {id:'used', label:'🕒 Más usados', test:n=>/hub2plus|hub2-4g|motioncam|motionprotect|doorprotect|streetsiren|homesiren|keypad|nvr108|nvr116|bulletcam|domecam|turretcam/.test(n)}
];
function quickDef204(id){ return QUICK_CATALOG_204.find(x=>x.id===id); }
function ensureQuickCatalog204(){
  const modal = document.getElementById('catalogModal');
  const row = modal ? modal.querySelector('.modal-search-row') : null;
  if(!row || document.getElementById('catalogQuick204')) return;
  const box = document.createElement('div');
  box.id = 'catalogQuick204';
  box.className = 'catalog-quick-panel';
  box.innerHTML = '<button type="button" class="quick-cat-chip active" data-q="">Todos</button>' +
    QUICK_CATALOG_204.map(x=>`<button type="button" class="quick-cat-chip" data-q="${x.id}">${x.label}</button>`).join('');
  const az = document.getElementById('catalogAZ');
  // Colocar acciones rápidas POR ENCIMA del A-Z
  if(az) az.insertAdjacentElement('beforebegin', box);
  else row.insertAdjacentElement('afterend', box);
  box.addEventListener('click', e=>{
    const btn = e.target.closest('.quick-cat-chip');
    if(!btn) return;
    catalogQuick204 = btn.dataset.q || '';
    document.querySelectorAll('.quick-cat-chip').forEach(b=>b.classList.toggle('active', b.dataset.q === catalogQuick204));
    pintarCatalogPanel(document.getElementById('catalogFilter')?.value || catalogTerm || '');
  });
}

const buscarCatalogo_BASE204 = buscarCatalogo;
buscarCatalogo = function(term=''){
  let lista = buscarCatalogo_BASE204.apply(this, arguments);
  if(catalogQuick204){
    const def = quickDef204(catalogQuick204);
    if(def){
      lista = lista.filter(x => def.test(normaliza((x.p && x.p.name) || '')));
    }
  }
  return lista;
};

const pintarCatalogPanel_BASE204 = pintarCatalogPanel;
pintarCatalogPanel = function(term=catalogTerm){
  ensureQuickCatalog204();
  pintarCatalogPanel_BASE204.apply(this, arguments);
  ensureQuickCatalog204();
  document.querySelectorAll('.quick-cat-chip').forEach(b=>b.classList.toggle('active', b.dataset.q === catalogQuick204));
};

const abrirCatalogo_BASE204 = typeof abrirCatalogo === 'function' ? abrirCatalogo : null;
if(abrirCatalogo_BASE204){
  abrirCatalogo = function(){
    catalogQuick204 = '';
    const r = abrirCatalogo_BASE204.apply(this, arguments);
    setTimeout(()=>{
      ensureQuickCatalog204();
      document.querySelectorAll('.quick-cat-chip').forEach(b=>b.classList.toggle('active', b.dataset.q === ''));
    }, 10);
    return r;
  };
}

document.addEventListener('DOMContentLoaded',()=>{
  try{
    ensureQuickCatalog204();
    document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_205}`; });
  }catch(e){}
});

/* =====================================================
   PATCH v2.0.6 PRO - Más usados con aprendizaje real
   - Aprende automáticamente cada producto añadido.
   - El botón 🕒 Más usados ya no usa lista fija: ordena por contador real.
   - No toca descripciones ni motor general.
   ===================================================== */
const APP_VERSION_206 = 'v2.0.6 PRO';
const STORAGE_USO_PRODUCTOS_206 = 'hiperajax_productos_mas_usados_v206';

function leerUsoProductos206(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_USO_PRODUCTOS_206) || '{}') || {}; }
  catch(e){ return {}; }
}
function guardarUsoProductos206(data){
  try{ localStorage.setItem(STORAGE_USO_PRODUCTOS_206, JSON.stringify(data || {})); }
  catch(e){}
}
function registrarUsoProducto206(p){
  if(!p || !p.name) return;
  const key = String(p.name).trim();
  if(!key) return;
  const data = leerUsoProductos206();
  const item = data[key] || {count:0, last:''};
  item.count = (Number(item.count)||0) + 1;
  item.last = new Date().toISOString();
  data[key] = item;
  guardarUsoProductos206(data);
}
function listaMasUsados206(term=''){
  const data = leerUsoProductos206();
  const q = normaliza(term||'').trim();
  const rows = productos
    .map((p,i)=>({p,i,u:data[p.name]||null,n:normaliza(p.name)}))
    .filter(x=>x.u && (Number(x.u.count)||0) > 0)
    .filter(x=>!q || x.n.includes(q) || normaliza(descripcionProducto(x.p).desc).includes(q))
    .sort((a,b)=>(Number(b.u.count)||0)-(Number(a.u.count)||0) || String(b.u.last||'').localeCompare(String(a.u.last||'')) || a.p.name.localeCompare(b.p.name,'es'))
    .slice(0,80)
    .map(x=>({p:x.p,i:x.i,score:100000+(Number(x.u.count)||0)}));
  return rows;
}

const addProductoObj_BASE206 = addProductoObj;
addProductoObj = function(p, qty=1, dto=null){
  const ok = addProductoObj_BASE206.apply(this, arguments);
  if(ok) registrarUsoProducto206(p);
  return ok;
};

const buscarCatalogo_BASE206 = buscarCatalogo;
buscarCatalogo = function(term=''){
  if(typeof catalogQuick204 !== 'undefined' && catalogQuick204 === 'used'){
    return listaMasUsados206(term);
  }
  return buscarCatalogo_BASE206.apply(this, arguments);
};

const pintarCatalogPanel_BASE206 = pintarCatalogPanel;
pintarCatalogPanel = function(term=catalogTerm){
  pintarCatalogPanel_BASE206.apply(this, arguments);
  try{
    if(typeof catalogQuick204 !== 'undefined' && catalogQuick204 === 'used'){
      const countWrap = document.querySelector('#catalogCount');
      const itemsWrap = document.querySelector('#catalogItems');
      const hasUsed = listaMasUsados206(term).length > 0;
      if(countWrap) countWrap.textContent = hasUsed ? countWrap.textContent + ' · por uso real' : '0 productos · añade productos para aprender';
      if(itemsWrap && !hasUsed){
        itemsWrap.innerHTML = '<div class="catalog-empty">Todavía no hay estadísticas. Añade productos y este filtro aprenderá tus más usados.</div>';
      }
    }
    document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_206}`; });
  }catch(e){}
};

document.addEventListener('DOMContentLoaded',()=>{
  try{
    document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_206}`; });
  }catch(e){}
});


/* =====================================================
   PATCH v2.0.7 PRO - UI catálogo uniforme + orden filtros
   - Botones Catálogo/Familias con texto corto.
   - Acciones rápidas debajo del buscador y encima del A-Z.
   ===================================================== */
(function(){
  function fixCatalogButtons207(){
    const c=document.getElementById('btnCatalogo'); if(c) c.innerHTML='<span class="btn-ico">📖</span>Catálogo';
    const f=document.getElementById('btnFamilias'); if(f) f.innerHTML='<span class="btn-ico">🧭</span>Explorar';
  }
  function orderCatalogFilters207(){
    const row=document.querySelector('#catalogModal .modal-search-row');
    const quick=document.getElementById('catalogQuick204');
    const az=document.getElementById('catalogAZ');
    if(!row) return;
    if(quick && quick.previousElementSibling !== row){
      row.insertAdjacentElement('afterend', quick);
    }
    if(quick && az && az.previousElementSibling !== quick){
      quick.insertAdjacentElement('afterend', az);
    }else if(!quick && az && az.previousElementSibling !== row){
      row.insertAdjacentElement('afterend', az);
    }
  }
  const _ensureQuick = typeof ensureQuickCatalog204 === 'function' ? ensureQuickCatalog204 : null;
  if(_ensureQuick){
    ensureQuickCatalog204 = function(){
      const r=_ensureQuick.apply(this, arguments);
      fixCatalogButtons207();
      orderCatalogFilters207();
      return r;
    };
  }
  const _ensureAZ = typeof ensureAlphabet193 === 'function' ? ensureAlphabet193 : null;
  if(_ensureAZ){
    ensureAlphabet193 = function(){
      const r=_ensureAZ.apply(this, arguments);
      orderCatalogFilters207();
      return r;
    };
  }
  const _pintar = typeof pintarCatalogPanel === 'function' ? pintarCatalogPanel : null;
  if(_pintar){
    pintarCatalogPanel = function(){
      const r=_pintar.apply(this, arguments);
      setTimeout(()=>{ fixCatalogButtons207(); orderCatalogFilters207(); },0);
      return r;
    };
  }
  document.addEventListener('DOMContentLoaded',()=>{ fixCatalogButtons207(); setTimeout(orderCatalogFilters207,50); document.querySelectorAll('.creator').forEach(el=>{ el.textContent='· Creado por David Corregidor · 4.0.7'; }); });
})();

/* =====================================================
   PATCH v2.0.8 PRO - filtros del catálogo bien colocados
   - En Catálogo: buscador -> acciones rápidas -> A-Z -> productos.
   - En Familias: buscador -> A-Z -> productos, sin acciones rápidas.
   - No toca descripciones ni motor de búsqueda.
   ===================================================== */
(function(){
  const APP_VERSION_208 = 'v2.0.8 PRO';
  let catalogOpenedFromFamily208 = false;

  function ensureCatalogHosts208(){
    const modal = document.getElementById('catalogModal');
    const row = modal ? modal.querySelector('.modal-search-row') : null;
    const items = document.getElementById('catalogItems');
    if(!row || !items) return null;

    let wrap = document.getElementById('catalogTopFilters208');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = 'catalogTopFilters208';
      wrap.className = 'catalog-top-filters';
      wrap.innerHTML = '<div id="catalogQuickHost208"></div><div id="catalogAZHost208"></div>';
      row.insertAdjacentElement('afterend', wrap);
    }

    // Asegurar que el bloque completo siempre queda justo después del buscador.
    if(wrap.previousElementSibling !== row){
      row.insertAdjacentElement('afterend', wrap);
    }
    return wrap;
  }

  function placeCatalogFilters208(){
    const wrap = ensureCatalogHosts208();
    if(!wrap) return;
    const quick = document.getElementById('catalogQuick204');
    const az = document.getElementById('catalogAZ');
    const quickHost = document.getElementById('catalogQuickHost208');
    const azHost = document.getElementById('catalogAZHost208');

    if(quick && quickHost && quick.parentElement !== quickHost){
      quickHost.appendChild(quick);
    }
    if(az && azHost && az.parentElement !== azHost){
      azHost.appendChild(az);
    }

    // Si vienes desde Familias, las acciones rápidas no aportan nada.
    if(quickHost){
      quickHost.style.display = catalogOpenedFromFamily208 ? 'none' : '';
    }
  }

  function setVersion208(){
    try{
      document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${APP_VERSION_208}`; });
    }catch(e){}
  }

  // Click normal en Catálogo: mostrar acciones rápidas.
  document.addEventListener('click', (e)=>{
    if(e.target.closest('#btnCatalogo')){
      catalogOpenedFromFamily208 = false;
      setTimeout(placeCatalogFilters208, 0);
      setTimeout(placeCatalogFilters208, 40);
    }
  }, true);

  // Click desde Familias: ocultar acciones rápidas en el catálogo que se abre después.
  document.addEventListener('click', (e)=>{
    if(e.target.closest('#familiasGrid .family-chip')){
      catalogOpenedFromFamily208 = true;
      setTimeout(placeCatalogFilters208, 0);
      setTimeout(placeCatalogFilters208, 80);
    }
  }, true);

  const _ensureAZ208 = typeof ensureAlphabet193 === 'function' ? ensureAlphabet193 : null;
  if(_ensureAZ208){
    ensureAlphabet193 = function(){
      const r = _ensureAZ208.apply(this, arguments);
      placeCatalogFilters208();
      return r;
    };
  }

  const _ensureQuick208 = typeof ensureQuickCatalog204 === 'function' ? ensureQuickCatalog204 : null;
  if(_ensureQuick208){
    ensureQuickCatalog204 = function(){
      const r = _ensureQuick208.apply(this, arguments);
      placeCatalogFilters208();
      return r;
    };
  }

  const _pintar208 = typeof pintarCatalogPanel === 'function' ? pintarCatalogPanel : null;
  if(_pintar208){
    pintarCatalogPanel = function(){
      const r = _pintar208.apply(this, arguments);
      placeCatalogFilters208();
      setVersion208();
      return r;
    };
  }

  const _abrirCatalogo208 = typeof abrirCatalogo === 'function' ? abrirCatalogo : null;
  if(_abrirCatalogo208){
    abrirCatalogo = function(){
      const r = _abrirCatalogo208.apply(this, arguments);
      setTimeout(placeCatalogFilters208, 0);
      setTimeout(placeCatalogFilters208, 40);
      setVersion208();
      return r;
    };
  }

  document.addEventListener('DOMContentLoaded',()=>{
    setVersion208();
    setTimeout(placeCatalogFilters208, 60);
  });
})();

/* =====================================================
   PATCH v2.0.16 PRO - filtros del modal estables
   - Evita que acciones rápidas / A-Z salten abajo al seleccionar un atajo.
   - En Catálogo: buscador -> acciones rápidas -> A-Z -> productos.
   - En Familias: buscador -> A-Z -> productos.
   ===================================================== */
(function(){
  const APP_VERSION_2016 = 'v2.0.16 PRO';
  let openedFromFamilies2016 = false;

  function setVersion2016(){
    try{
      document.querySelectorAll('.creator').forEach(el=>{
        el.textContent = `· Creado por David Corregidor · ${APP_VERSION_2016}`;
      });
    }catch(e){}
  }

  function ensureTopFilterHost2016(){
    const modal = document.getElementById('catalogModal');
    const row = modal ? modal.querySelector('.modal-search-row') : null;
    if(!row) return null;

    let wrap = document.getElementById('catalogTopFilters208') || document.getElementById('catalogTopFilters2016');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = 'catalogTopFilters2016';
      wrap.className = 'catalog-top-filters';
      wrap.innerHTML = '<div id="catalogQuickHost208"></div><div id="catalogAZHost208"></div>';
    }

    if(wrap.previousElementSibling !== row){
      row.insertAdjacentElement('afterend', wrap);
    }

    if(!document.getElementById('catalogQuickHost208')){
      const qh = document.createElement('div');
      qh.id = 'catalogQuickHost208';
      wrap.appendChild(qh);
    }
    if(!document.getElementById('catalogAZHost208')){
      const ah = document.createElement('div');
      ah.id = 'catalogAZHost208';
      wrap.appendChild(ah);
    }
    return wrap;
  }

  function placeFilters2016(){
    const wrap = ensureTopFilterHost2016();
    if(!wrap) return;

    const quick = document.getElementById('catalogQuick204');
    const az = document.getElementById('catalogAZ');
    const quickHost = document.getElementById('catalogQuickHost208');
    const azHost = document.getElementById('catalogAZHost208');

    if(quick && quickHost && quick.parentElement !== quickHost){
      quickHost.appendChild(quick);
    }
    if(az && azHost && az.parentElement !== azHost){
      azHost.appendChild(az);
    }

    if(quickHost){
      quickHost.style.display = openedFromFamilies2016 ? 'none' : '';
    }
  }

  function placeFiltersSoon2016(){
    placeFilters2016();
    setTimeout(placeFilters2016, 0);
    setTimeout(placeFilters2016, 40);
    setTimeout(placeFilters2016, 120);
  }

  document.addEventListener('click', (e)=>{
    if(e.target.closest('#btnCatalogo')){
      openedFromFamilies2016 = false;
      placeFiltersSoon2016();
    }
    if(e.target.closest('#btnFamilias') || e.target.closest('#familiasGrid .family-chip')){
      openedFromFamilies2016 = true;
      placeFiltersSoon2016();
    }
    if(e.target.closest('.quick-cat-chip') || e.target.closest('.az-chip')){
      placeFiltersSoon2016();
    }
  }, true);

  document.addEventListener('input', (e)=>{
    if(e.target && e.target.id === 'catalogFilter') placeFiltersSoon2016();
  }, true);

  const _pintar2016 = typeof pintarCatalogPanel === 'function' ? pintarCatalogPanel : null;
  if(_pintar2016){
    pintarCatalogPanel = function(){
      const r = _pintar2016.apply(this, arguments);
      placeFiltersSoon2016();
      setVersion2016();
      return r;
    };
  }

  const _abrirCatalogo2016 = typeof abrirCatalogo === 'function' ? abrirCatalogo : null;
  if(_abrirCatalogo2016){
    abrirCatalogo = function(){
      const r = _abrirCatalogo2016.apply(this, arguments);
      placeFiltersSoon2016();
      setVersion2016();
      return r;
    };
  }

  document.addEventListener('DOMContentLoaded',()=>{
    setVersion2016();
    setTimeout(placeFilters2016, 80);
  });
})();

/* =====================================================
   v2.1.1 PRO - Explorar afinado
   - Un solo scroll: productos.
   - Reorganiza subfamilias para evitar listas enormes.
   - HubKit/StarterKit separados como Kits.
   - Videovigilancia sin brackets/covers/storage.
   - Soportes/JunctionBox en Accesorios.
   ===================================================== */
(function(){
  const VERSION_EXPLORE_211 = '4.0.7';
  function n211(s){ return normaliza(String(s||'')).replace(/[^a-z0-9]+/g,''); }
  function raw211(p){ return n211(p && p.name); }
  function has211(name, parts){ return parts.some(k=>name.includes(k)); }
  function not211(name, parts){ return !parts.some(k=>name.includes(k)); }
  function countPred(pred){ try{return productos.filter(pred).length;}catch(e){return 0;} }
  function isVideoAcc(s){ return has211(s,['bracket','mountcam','junctionbox','hood','cover','frame','storage','hstd','tf','psu','dc12','dc6','ac220','pcb']); }

  const DEFAULT_EXPLORE_211 = [
    {id:'intrusion', icon:'🏠', title:'Intrusión', subs:[
      {icon:'🏠', title:'Hubs', pred:p=>{const s=raw211(p); return has211(s,['ajhub','hub2plus','hubbp']) && not211(s,['hubkit','hub2kit','starterkit','bracket','battery','hubbatt','psu','dummy','repairkit','minihub','brackethub']);}},
      {icon:'📦', title:'Kits alarma', pred:p=>{const s=raw211(p); return (has211(s,['hubkit','hub2kit','starterkit']) && !has211(s,['repairkit'])) || has211(s,['starterkitplus']);}},
      {icon:'📡', title:'ReX', pred:p=>{const s=raw211(p); return has211(s,['rex']) && !has211(s,['psu','bracket','battery']);}},
      {icon:'🚶', title:'Motion / Outdoor', pred:p=>{const s=raw211(p); return has211(s,['motionprotect','outdoorprotect']) && !has211(s,['dummy','lens','curtain','bracket']);}},
      {icon:'📷', title:'MotionCam / PhOD', pred:p=>{const s=raw211(p); return has211(s,['motioncam']) && !has211(s,['dummy','lens','hood','bracket']);}},
      {icon:'🚪', title:'DoorProtect', pred:p=>{const s=raw211(p); return has211(s,['doorprotect']) && !has211(s,['dummy','bracket','magnet']);}},
      {icon:'🪟', title:'GlassProtect', pred:p=>{const s=raw211(p); return has211(s,['glassprotect']) && !has211(s,['dummy','bracket']);}},
      {icon:'🟢', title:'Curtain', pred:p=>{const s=raw211(p); return has211(s,['curtainprotect','curtainoutdoor','dualcurtain','curtaincam']) && !has211(s,['dummy','bracket']);}},
      {icon:'⌨️', title:'Teclados', pred:p=>{const s=raw211(p); return has211(s,['keypad']) && !has211(s,['dummy','bracket']);}},
      {icon:'📢', title:'Sirenas', pred:p=>{const s=raw211(p); return has211(s,['homesiren','streetsiren']) && !has211(s,['dummy','bracket','speakerss']);}},
      {icon:'🎛️', title:'Mandos / botones', pred:p=>{const s=raw211(p); return has211(s,['spacecontrol','button','doublebutton']) && !has211(s,['centerbutton','sidebutton','solobutton','dummy']);}},
      {icon:'🧠', title:'Transmisores', pred:p=>{const s=raw211(p); return has211(s,['transmitter','uartbridge','ocbridge','vhfbridge']) && !has211(s,['dummy','bracket','case']);}}
    ]},
    {id:'video', icon:'📷', title:'Videovigilancia', subs:[
      {icon:'📷', title:'BulletCam', pred:p=>{const s=raw211(p); return has211(s,['bulletcam']) && !isVideoAcc(s);}},
      {icon:'📷', title:'DomeCam', pred:p=>{const s=raw211(p); return has211(s,['domecam']) && !isVideoAcc(s);}},
      {icon:'📷', title:'TurretCam', pred:p=>{const s=raw211(p); return has211(s,['turretcam']) && !isVideoAcc(s);}},
      {icon:'🏠', title:'IndoorCam', pred:p=>{const s=raw211(p); return has211(s,['indoorcam']) && !isVideoAcc(s);}},
      {icon:'🚪', title:'DoorBell', pred:p=>{const s=raw211(p); return has211(s,['doorbell']) && !isVideoAcc(s);}},
      {icon:'🎥', title:'NVR', pred:p=>{const s=raw211(p); return has211(s,['nvr']) && !has211(s,['nvrkit','psu','storage']);}},
      {icon:'📦', title:'Kits NVR', pred:p=>{const s=raw211(p); return has211(s,['nvrkit']);}},
      {icon:'💽', title:'Discos HDD', pred:p=>/^hd\d+tb/i.test(p.name||'')}
    ]},
    {id:'domotica', icon:'💡', title:'Domótica', subs:[
      {icon:'💡', title:'Interruptores de luz', pred:p=>{const s=raw211(p); return has211(s,['lightcore','lightswitch']) && !has211(s,['centerbutton','sidebutton','solobutton','frame','cover']);}},
      {icon:'🔌', title:'Bases de enchufe', pred:p=>{const s=raw211(p); return has211(s,['outletcore','outletbasic','outletlan','outlet']) && !has211(s,['cover','socket']);}},
      {icon:'⚡', title:'Enchufes inteligentes', pred:p=>{const s=raw211(p); return has211(s,['socket']) && !has211(s,['sim','cover','button']);}},
      {icon:'🧩', title:'Tapas y acabados', pred:p=>{const s=raw211(p); return has211(s,['centercove','sidecove','solocove','coverplate','bypassdimmer']);}},
      {icon:'🖼️', title:'Marcos', pred:p=>{const s=raw211(p); return has211(s,['frame']) && !has211(s,['case']);}},
      {icon:'🎛️', title:'Botones LightSwitch', pred:p=>{const s=raw211(p); return has211(s,['centerbutton','sidebutton','solobutton']);}},
      {icon:'📦', title:'SurfaceBox', pred:p=>{const s=raw211(p); return has211(s,['surfacebox']);}},
      {icon:'⚙️', title:'Relés', pred:p=>{const s=raw211(p); return has211(s,['relay','wallswitch','multirelay']) && !has211(s,['dinholder']);}}
    ]},
    {id:'seguridad', icon:'🔥', title:'Incendio / seguridad', subs:[
      {icon:'🔥', title:'FireProtect', pred:p=>{const s=raw211(p); return has211(s,['fireprotect']) && !has211(s,['dummy','bracket']);}},
      {icon:'🚨', title:'ManualCallPoint', pred:p=>{const s=raw211(p); return has211(s,['manualcallpoint','keymcp']);}},
      {icon:'💧', title:'LeaksProtect', pred:p=>{const s=raw211(p); return has211(s,['leaksprotect']);}},
      {icon:'🚰', title:'WaterStop', pred:p=>{const s=raw211(p); return has211(s,['waterstop']);}},
      {icon:'🌡️', title:'LifeQuality', pred:p=>{const s=raw211(p); return has211(s,['lifequality']);}}
    ]},
    {id:'accesorios', icon:'🧩', title:'Accesorios', subs:[
      {icon:'🧰', title:'JunctionBox', pred:p=>{const s=raw211(p); return has211(s,['junctionbox']);}},
      {icon:'🛠️', title:'Bracket / soportes', pred:p=>{const s=raw211(p); return has211(s,['bracket','mountcam','hood','dinholder']) && !has211(s,['junctionbox']);}},
      {icon:'📦', title:'Carcasas / Dummy', pred:p=>{const s=raw211(p); return has211(s,['dummy','case','democase','suitcase','totem']);}},
      {icon:'🧩', title:'Tapas / covers', pred:p=>{const s=raw211(p); return has211(s,['cover','coverplate','frame','surfacebox']) && !has211(s,['coverholder']);}},
      {icon:'🔋', title:'Fuentes / baterías', pred:p=>{const s=raw211(p); return has211(s,['psu','battery','batt','pcb','ac220','dc12','dc6','dc1224','internalbattery']);}},
      {icon:'🔐', title:'Pass / Tag', pred:p=>{const s=raw211(p); return has211(s,['pass','tag']);}},
      {icon:'📶', title:'SIM / antenas', pred:p=>{const s=raw211(p); return (has211(s,['simslot','sim','m2m','externalantenna']) || /(^|-)SIM($|-)/i.test(p.name||'')) && !has211(s,['homesiren','streetsiren','bracket','dummy']);}},
      {icon:'🧲', title:'Recambios', pred:p=>{const s=raw211(p); return has211(s,['magnet','reedswitch','lens','repairkit']) && !has211(s,['bracket','storage']);}},
      {icon:'💾', title:'Storage / memoria', pred:p=>{const s=raw211(p); const raw=String((p&&p.name)||''); return (has211(s,['storage','hstd','hdd']) || /^HS[-_ ]?TF/i.test(raw) || /^HD\d+TB/i.test(raw)) && !has211(s,['bracket','mountcam','junctionbox','hood','cover','frame']);}},
      {icon:'👕', title:'Marketing / demo', pred:p=>{const s=raw211(p); return has211(s,['polo','tshirt','baseball','brandplate','cup']);}}
    ]}
  ];

  /*
     EXPLORADOR EDITABLE
     Si existe window.EXPLORAR_CATEGORIAS en explorar_config.js, el explorador se pinta desde ahí.
     Si no existe, usa DEFAULT_EXPLORE_211 para que la app nunca se rompa.
  */
  function arr211(v){ return Array.isArray(v) ? v : (v ? [v] : []); }
  function rulePred211(rule){
    const incluye = arr211(rule.incluye || rule.filtros || rule.palabras).map(n211).filter(Boolean);
    const excluye = arr211(rule.excluye || rule.excluir).map(n211).filter(Boolean);
    const empieza = arr211(rule.empieza || rule.empiezaPor).map(n211).filter(Boolean);
    const regex = arr211(rule.regex).map(r=>{ try{return new RegExp(r,'i');}catch(e){return null;} }).filter(Boolean);
    const exactos = arr211(rule.exactos || rule.referencias).map(n211).filter(Boolean);
    return function(p){
      const rawName = String((p && p.name) || '');
      const rawBrand = String((p && p.brand) || '');
      let rawDesc = '';
      try{
        const d = (typeof descripcionProducto === 'function') ? descripcionProducto(p) : null;
        rawDesc = d && d.desc ? String(d.desc) : '';
      }catch(e){}
      // El Explorer clasifica por referencia + segunda columna del CSV + descripción generada.
      // Así categorías genéricas como Switches o Routers siguen funcionando con productos futuros.
      const rawSearch = [rawName, rawBrand, rawDesc].filter(Boolean).join(' ');
      const s = n211(rawSearch);
      // OJO: aquí cada bloque solo cuenta si existe en la regla.
      // Antes, si una subcategoría solo tenía regex, incluye vacío daba TRUE y entraba todo.
      const ref = n211(rawName);
      const okIncluye = incluye.length ? incluye.some(k=>s.includes(k)) : false;
      // Las reglas estructurales se validan contra la referencia, no contra
      // la descripción. Evita que una categoría capture otra familia porque
      // su texto comercial menciona Hub, Motion, Sirena, etc.
      const okEmpieza = empieza.length ? empieza.some(k=>ref.startsWith(k)) : false;
      const okRegex = regex.length ? regex.some(r=>r.test(rawName)) : false;
      const okExactos = exactos.length ? exactos.includes(ref) : false;
      const hayCondiciones = incluye.length || empieza.length || regex.length || exactos.length;
      // Fácil de editar: incluye / empieza / regex / exactos funcionan como OR.
      // Ejemplo: incluye:['storage'] + regex:['^HD\\d+TB'] mete Storage O discos HD1TB/HD2TB.
      const okBase = hayCondiciones ? (okIncluye || okEmpieza || okRegex || okExactos) : false;
      const okExcluye = !excluye.length || !excluye.some(k=>s.includes(k));
      return okBase && okExcluye;
    };
  }
  function buildExternalExplore211(){
    const cfg = window.EXPLORAR_CATEGORIAS || window.EXPLORAR_CONFIG || null;
    const cats = Array.isArray(cfg) ? cfg : (cfg && Array.isArray(cfg.categorias) ? cfg.categorias : null);
    if(!cats || !cats.length) return null;
    return cats.filter(c=>c && c.visible !== false).map((c,ci)=>({
      id: c.id || ('cat_'+ci),
      icon: c.icono || c.icon || '📁',
      title: c.titulo || c.nombre || c.title || ('Categoría '+(ci+1)),
      subs: arr211(c.subcategorias || c.subs || c.familias).filter(s=>s && s.visible !== false).map((sub,si)=>({
        icon: sub.icono || sub.icon || c.icono || c.icon || '•',
        title: sub.titulo || sub.nombre || sub.title || ('Subfamilia '+(si+1)),
        pred: rulePred211(sub)
      }))
    })).filter(c=>c.subs && c.subs.length);
  }
  const EXPLORE_211 = buildExternalExplore211() || DEFAULT_EXPLORE_211;


  let expCat = null;
  let expSub = null;
  let expQuery = '';
  let expCatsScroll211 = 0;
  let expSubsScroll211 = 0;
  let expMobileStep = 'cats';

  function currentCat(){ return expCat ? (EXPLORE_211.find(c=>c.id===expCat) || null) : null; }
  function currentSub(){ const c=currentCat(); return c && expSub ? ((c.subs||[]).find(s=>s.title===expSub) || null) : null; }
  /* Búsqueda global inteligente del Explorador.
     Sin texto: respeta la categoría/subfamilia elegida.
     Con texto: busca en TODO el catálogo, con sinónimos, intención y errores leves. */
  const EXPLORE_ALIASES_300 = {
    wifi:['wi fi','inalambrico','wireless','wlan'],
    lte:['4g','sim','movil','datos'],
    '4g':['lte','sim','movil'],
    inundacion:['fuga','agua','leaksprotect','leak'],
    fuga:['inundacion','agua','leaksprotect'],
    humo:['incendio','fireprotect','fuego'],
    incendio:['humo','fireprotect','fuego'],
    llavero:['mando','spacecontrol','control remoto'],
    mando:['llavero','spacecontrol','control remoto'],
    enchufe:['socket','toma'],
    rele:['relay','automatizacion'],
    interruptor:['lightswitch','luz'],
    teclado:['keypad'],
    sirena:['homesiren','streetsiren'],
    exterior:['outdoor','calle','jardin'],
    interior:['indoor'],
    domo:['dome','domecam'],
    torreta:['turret','turretcam'],
    bala:['bullet','bulletcam'],
    grabador:['nvr','videograbador'],
    disco:['hdd','storage','memoria'],
    fotosensor:['photo on demand','photoondemand','foto bajo demanda'],
    cortina:['curtain','curtainprotect'],
    movimiento:['motion','motionprotect'],
    puerta:['doorprotect','contacto magnetico'],
    ventana:['doorprotect','contacto magnetico'],
    cristal:['glassprotect','rotura'],
    co:['monoxido','carbon monoxide'],
    poe:['power over ethernet','ethernet'],
    fibra:['fiber','fibra optica']
  };

  function lev300(a,b){
    a=String(a||''); b=String(b||'');
    if(a===b) return 0;
    if(!a.length) return b.length;
    if(!b.length) return a.length;
    const prev=Array.from({length:b.length+1},(_,i)=>i), cur=new Array(b.length+1);
    for(let i=1;i<=a.length;i++){
      cur[0]=i;
      let rowMin=cur[0];
      for(let j=1;j<=b.length;j++){
        cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
        rowMin=Math.min(rowMin,cur[j]);
      }
      if(rowMin>2 && Math.abs(a.length-b.length)>2) return rowMin;
      for(let j=0;j<=b.length;j++) prev[j]=cur[j];
    }
    return prev[b.length];
  }

  function expand300(query){
    const base=n211(query).split(/\s+/).filter(Boolean);
    const out=[];
    base.forEach(t=>{
      out.push(t);
      (EXPLORE_ALIASES_300[t]||[]).forEach(x=>n211(x).split(/\s+/).forEach(y=>y&&out.push(y)));
    });
    return [...new Set(out)];
  }

  function searchText300(p){
    let d={};
    try{ d=descripcionProducto(p)||{}; }catch(e){}
    const meta=p&&p.meta?p.meta:{};
    return n211([
      p&&p.name,p&&p.brand,p&&p.ref,p&&p.reference,p&&p.sku,
      d.desc,d.family,d.official,d.icon,
      meta.family,meta.sub,meta.desc,meta.official,
      Array.isArray(meta.tags)?meta.tags.join(' '):meta.tags,
      p&&p._search175,p&&p._search183,p&&p._search186
    ].filter(Boolean).join(' '));
  }

  let EXPLORE_INDEX_300 = [];
  let EXPLORE_INDEX_LEN_300 = -1;
  function getExploreIndex300(){
    if(EXPLORE_INDEX_LEN_300 === productos.length && EXPLORE_INDEX_300.length) return EXPLORE_INDEX_300;
    EXPLORE_INDEX_LEN_300 = productos.length;
    EXPLORE_INDEX_300 = productos.map((p,i)=>{
      let d={};
      try{ d=descripcionProducto(p)||{}; }catch(e){}
      return {
        ...p,
        name:p.name,
        description:[d.desc,d.family,d.official,p._search175,p._search183,p._search186].filter(Boolean).join(' '),
        _hxaIndex:i
      };
    });
    return EXPLORE_INDEX_300;
  }
  const EXPLORE_SEARCH_CACHE_300 = new Map();

  function smartExplore300(query){
    const q=n211(query).trim();
    if(!q) return [];
    /* Motor compartido: CSV completo + conocimiento opcional.
       Si el módulo no carga, conserva el buscador anterior como fallback. */
    try{
      if(window.HXA_KNOWLEDGE_ENGINE && typeof window.HXA_KNOWLEDGE_ENGINE.rank === 'function'){
        const cacheKey=q+'|'+productos.length;
        if(EXPLORE_SEARCH_CACHE_300.has(cacheKey)) return EXPLORE_SEARCH_CACHE_300.get(cacheKey);
        const ranked = window.HXA_KNOWLEDGE_ENGINE.rank(getExploreIndex300(), query, 300)
          .map(x=>({p:productos[x._hxaIndex],i:x._hxaIndex,score:x._score,reasons:x._reasons||[]}))
          .filter(x=>x.p);
        if(EXPLORE_SEARCH_CACHE_300.size>120) EXPLORE_SEARCH_CACHE_300.clear();
        const ordenados=sortFamilyResults300(ranked,q);
        EXPLORE_SEARCH_CACHE_300.set(cacheKey,ordenados);
        return ordenados;
      }
    }catch(e){ console.warn('Knowledge Engine Explorer fallback',e); }

    const rawTokens=q.split(/\s+/).filter(Boolean);
    const expanded=expand300(q);
    const resultados=productos.map((p,i)=>{
      const name=n211((p&&p.name)||'');
      const text=searchText300(p);
      const words=[...new Set(text.split(/[^a-z0-9]+/).filter(Boolean))];
      let score=0, matched=0;
      if(name===q) score+=150000;
      if(name.startsWith(q)) score+=90000;
      if(name.includes(q)) score+=65000;
      if(text.includes(q)) score+=30000;
      rawTokens.forEach(token=>{
        let ok=false;
        if(name.split(/[^a-z0-9]+/).includes(token)){score+=30000;ok=true;}
        else if(name.includes(token)){score+=22000;ok=true;}
        else if(text.includes(token)){score+=9000;ok=true;}
        if(!ok && token.length>=4){
          const near=words.some(w=>Math.abs(w.length-token.length)<=1 && lev300(token,w)<=1);
          if(near){score+=4500;ok=true;}
        }
        if(ok) matched++;
      });
      expanded.forEach(token=>{
        if(!rawTokens.includes(token) && text.includes(token)) score+=3500;
      });
      if(matched===rawTokens.length) score+=18000;
      const accessory=/cover|bracket|mount|holder|box|dummy|case|tapa|soporte|carcasa/.test(name);
      const accessoryAsked=rawTokens.some(t=>['cover','bracket','mount','holder','box','tapa','soporte','carcasa','accesorio'].includes(t));
      if(accessory && !accessoryAsked) score-=7000;
      return {p,i,score};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.p.name.localeCompare(b.p.name,'es')).slice(0,300);
    return sortFamilyResults300(resultados,q);
  }

  // Agrupación automática de variantes del Explorer.
  // No necesita reglas por familia: elimina únicamente el token de color W/B
  // de la referencia y mantiene juntas todas las variantes del mismo producto.
  function exploreFamilyKey300(product){
    return String((product && product.name) || '')
      .toUpperCase()
      .replace(/-(?:W|B)(?=-|$)/g, '')
      .replace(/--+/g, '-')
      .replace(/-$/,'')
      .trim();
  }
  function exploreColorOrder300(product){
    const ref=String((product && product.name) || '').toUpperCase();
    if(/-W(?:-|$)/.test(ref)) return 0;
    if(/-B(?:-|$)/.test(ref)) return 1;
    return 2;
  }
  function sortFamilyResults300(items,query=''){
    const lista=Array.isArray(items)?items.slice():[];
    const grupos=new Map();
    lista.forEach((item,pos)=>{
      const key=exploreFamilyKey300(item.p);
      if(!grupos.has(key)) grupos.set(key,{key,items:[],bestScore:-Infinity,first:pos});
      const g=grupos.get(key);
      g.items.push({...item,__hxPos:pos});
      g.bestScore=Math.max(g.bestScore,Number(item.score)||0);
      g.first=Math.min(g.first,pos);
    });
    const buscaNegro=/\b(?:negro|black|\-b)\b/i.test(String(query||''));
    const buscaBlanco=/\b(?:blanco|white|\-w)\b/i.test(String(query||''));
    return [...grupos.values()]
      .sort((a,b)=>(b.bestScore-a.bestScore)||(a.first-b.first)||a.key.localeCompare(b.key,'es',{numeric:true,sensitivity:'base'}))
      .flatMap(g=>g.items.sort((a,b)=>{
        let ca=exploreColorOrder300(a.p), cb=exploreColorOrder300(b.p);
        if(buscaNegro){ ca=ca===1?0:ca===0?1:ca; cb=cb===1?0:cb===0?1:cb; }
        else if(buscaBlanco){ ca=ca===0?0:ca===1?1:ca; cb=cb===0?0:cb===1?1:cb; }
        return ca-cb || (Number(b.score)||0)-(Number(a.score)||0) || String(a.p.name||'').localeCompare(String(b.p.name||''),'es',{numeric:true,sensitivity:'base'});
      }).map(({__hxPos,...item})=>item));
  }
  function filteredProducts(){
    const q=String(expQuery||'').trim();
    if(q) return smartExplore300(q);
    const sub=currentSub();
    if(!sub) return [];

    const lista=productos.map((p,i)=>({p,i})).filter(x=>sub.pred(x.p));
    // El precio mínimo de cada familia se usa para ordenar familias completas,
    // nunca productos sueltos. Así W y B permanecen contiguos automáticamente.
    const familyMinPrice=new Map();
    lista.forEach(x=>{
      const key=exploreFamilyKey300(x.p);
      const price=Number(x.p.pvp)||0;
      if(!familyMinPrice.has(key) || price<familyMinPrice.get(key)) familyMinPrice.set(key,price);
    });

    return lista.sort((a,b)=>{
      const familyA=exploreFamilyKey300(a.p);
      const familyB=exploreFamilyKey300(b.p);
      if(familyA!==familyB){
        const byFamilyPrice=(familyMinPrice.get(familyA)||0)-(familyMinPrice.get(familyB)||0);
        if(byFamilyPrice) return byFamilyPrice;
        return familyA.localeCompare(familyB,'es',{numeric:true,sensitivity:'base'});
      }
      const byColor=exploreColorOrder300(a.p)-exploreColorOrder300(b.p);
      if(byColor) return byColor;
      const byPrice=(Number(a.p.pvp)||0)-(Number(b.p.pvp)||0);
      if(byPrice) return byPrice;
      return String(a.p.name||'').localeCompare(String(b.p.name||''),'es',{numeric:true,sensitivity:'base'});
    });
  }

  function productRow(x){
    const d = descripcionProducto(x.p);
    return `<div class="explore-product" data-index="${x.i}">
      <div class="explore-product-main"><strong>${escapeHtml(d.icon)} ${escapeHtml(x.p.name)}</strong><span>${escapeHtml(d.desc)}</span></div>
      <b>${fmt.format(x.p.pvp)}</b>
      ${hxQtyControlHtml('explorer', x.i)}
      <button type="button" class="catalog-add explore-add" data-index="${x.i}">Añadir</button>
    </div>`;
  }

  function isMobileExplore(){
    return window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
  }

  function firstValidSub(cat){
    return cat.subs?.find(s=>countPred(s.pred)>0)?.title || cat.subs?.[0]?.title || null;
  }

  function renderExplore(){
    const grid = document.getElementById('familiasGrid');
    if(!grid) return;
    const mobile = isMobileExplore();
    const c = currentCat();
    const sub = currentSub();
    const list = filteredProducts();

    function bindProductEvents(root){
      function addExplorePersistent(idx, trigger){
        const scrollHost = root.querySelector('.explore-products, .explore-mobile-panel');
        const scrollTop = scrollHost ? scrollHost.scrollTop : 0;
        const qty = hxModalQtyGet('explorer', idx);
        hxAddProductoModal('explorer', Number(idx), qty);
        if(trigger){
          const original = trigger.textContent;
          trigger.textContent = '✓ Añadido';
          trigger.classList.add('added-ok');
          setTimeout(()=>{ trigger.textContent = original || 'Añadir'; trigger.classList.remove('added-ok'); }, 750);
        }
        /* No volver a renderizar todo el Explorador: conserva DOM,
           categoría, filtro y scroll para que el siguiente producto sea inmediato. */
        if(scrollHost) scrollHost.scrollTop = scrollTop;
        const input = document.getElementById('exploreFilter210');
        if(input){ setTimeout(()=>{ input.focus(); input.select(); }, 0); }
      }
      hxBindQtyControls(root, 'explorer');
      const touchUi = !!(window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches);
      if(!touchUi){
        root.querySelectorAll('.explore-product').forEach(el=>el.addEventListener('dblclick',()=>{ addExplorePersistent(Number(el.dataset.index), null); }));
        root.querySelectorAll('.explore-product').forEach(el=>el.addEventListener('click',()=>{ seleccionarProducto(Number(el.dataset.index), true); }));
      }
      root.querySelectorAll('.explore-add').forEach(btn=>btn.addEventListener('click',e=>{ e.stopPropagation(); addExplorePersistent(Number(btn.dataset.index), btn); }));
      if(touchUi){
        root.querySelectorAll('button,.explore-product').forEach(el=>{
          const clearTouchState=()=>{
            try{ el.blur(); }catch(_){}
            try{
              const active=document.activeElement;
              if(active && root.contains(active) && typeof active.blur==='function') active.blur();
            }catch(_){}
          };
          el.addEventListener('touchstart',clearTouchState,{passive:true});
          el.addEventListener('touchend',()=>{
            clearTouchState();
            requestAnimationFrame(clearTouchState);
            setTimeout(clearTouchState,40);
          },{passive:true});
          el.addEventListener('pointerup',()=>setTimeout(clearTouchState,0),{passive:true});
        });
      }
    }

    if(mobile){
      const catsHtml = EXPLORE_211.map(cat=>{
        const fams = (cat.subs||[]).length;
        return `<button type="button" class="explore-cat ${cat.id===expCat?'active':''}" data-cat="${cat.id}"><span>${cat.icon} ${cat.title}</span><em>${fams}</em></button>`;
      }).join('');
      const subsHtml = ((c&&c.subs)||[]).map(s=>{
        const total = countPred(s.pred);
        return `<button type="button" class="explore-sub ${s.title===expSub?'active':''}" data-sub="${escapeHtml(s.title)}"><span>${s.icon} ${escapeHtml(s.title)}</span><em>${total}</em></button>`;
      }).join('');
      let body='';
      let title='Categorías';
      if(expMobileStep === 'subs'){
        title = c ? `${c.icon} ${c.title}` : 'Subcategorías';
        body = `<div class="explore-mobile-list explore-mobile-subs">${subsHtml}</div>`;
      }else if(expMobileStep === 'products'){
        title = `${sub ? sub.icon+' '+sub.title : (c ? c.icon+' '+c.title : 'Resultados')}`;
        body = `<div class="explore-products explore-mobile-products">${list.map(productRow).join('') || '<div class="catalog-empty">No hay productos en esta subfamilia.</div>'}</div>`;
      }else{
        expMobileStep = 'cats';
        title = 'Categorías';
        body = `<div class="explore-mobile-list explore-mobile-cats">${catsHtml}</div>`;
      }
      grid.innerHTML = `
        <div class="explore-wrap explore-mobile-wrap">
          <div class="explore-search"><input id="exploreFilter210" autocomplete="off" placeholder="Buscar en todo el catálogo AJAX..." value="${escapeHtml(expQuery)}"><span>${list.length} productos</span></div>
          <div class="explore-mobile-head">
            ${expMobileStep==='cats' ? '' : '<button type="button" class="explore-back">← Atrás</button>'}
            <div class="explore-breadcrumb">🧭 Explorar ${expMobileStep!=='cats' && c ? '<b>›</b> '+escapeHtml(c.icon)+' '+escapeHtml(c.title) : ''} ${expMobileStep==='products' && sub ? '<b>›</b> '+escapeHtml(sub.icon)+' '+escapeHtml(sub.title) : ''}</div>
          </div>
          <div class="explore-mobile-title">${escapeHtml(title)}</div>
          <div class="explore-mobile-panel">${body}</div>
        </div>`;
      const input = document.getElementById('exploreFilter210');
      if(input){
        let timer; input.addEventListener('input',e=>{
          /* La escritura manda: solo guardamos el valor aquí. El render pesado
             se ejecuta cuando el usuario lleva un instante sin pulsar. */
          expQuery=e.target.value;
          clearTimeout(timer);
          timer=setTimeout(()=>{
            const latest=String(expQuery||'');
            requestAnimationFrame(()=>{
              if(latest.trim()) expMobileStep='products';
              renderExplore();
              requestAnimationFrame(()=>{
                const i=document.getElementById('exploreFilter210');
                if(i){ i.focus({preventScroll:true}); i.setSelectionRange(i.value.length,i.value.length); }
              });
            });
          },360);
        });
      }
      grid.querySelector('.explore-back')?.addEventListener('click',()=>{
        if(expMobileStep === 'products') expMobileStep = 'subs';
        else expMobileStep = 'cats';
        expQuery='';
        renderExplore();
      });
      grid.querySelectorAll('.explore-cat').forEach(btn=>btn.addEventListener('click',()=>{
        expCat=btn.dataset.cat;
        const cc=currentCat();
        expSub=cc ? firstValidSub(cc) : null;
        expQuery='';
        expMobileStep='subs';
        renderExplore();
      }));
      grid.querySelectorAll('.explore-sub').forEach(btn=>btn.addEventListener('click',()=>{
        expSub=btn.dataset.sub;
        expQuery='';
        expMobileStep='products';
        renderExplore();
      }));
      bindProductEvents(grid);
      return;
    }

    const catsHtml = EXPLORE_211.map(cat=>{
      const fams = (cat.subs||[]).length;
      return `<button type="button" class="explore-cat ${cat.id===expCat?'active':''}" data-cat="${cat.id}"><span>${cat.icon} ${cat.title}</span><em>${fams}</em></button>`;
    }).join('');
    const subsHtml = ((c&&c.subs)||[]).map(s=>{
      const total = countPred(s.pred);
      return `<button type="button" class="explore-sub ${s.title===expSub?'active':''}" data-sub="${escapeHtml(s.title)}"><span>${s.icon} ${escapeHtml(s.title)}</span><em>${total}</em></button>`;
    }).join('');
    const initialHelp = !expQuery.trim() && !c;
    grid.innerHTML = `
      <div class="explore-wrap">
        <div class="explore-search"><input id="exploreFilter210" autocomplete="off" placeholder="Buscar en todo el catálogo AJAX..." value="${escapeHtml(expQuery)}"><span>${list.length} productos</span></div>
        <div class="explore-breadcrumb">🧭 ${c ? 'Explorar <b>›</b> '+escapeHtml(c.icon)+' '+escapeHtml(c.title)+(sub ? ' <b>›</b> '+escapeHtml(sub.icon)+' '+escapeHtml(sub.title) : '') : 'Selecciona una categoría o escribe en el buscador'}</div>
        <div class="explore-layout">
          <div class="explore-col explore-cats">${catsHtml}</div>
          <div class="explore-col explore-subs">${subsHtml || '<div class="catalog-empty">Selecciona una categoría.</div>'}</div>
          <div class="explore-products">${initialHelp ? '<div class="catalog-empty">Selecciona una categoría o escribe en el buscador para encontrar cualquier producto.</div>' : (list.map(productRow).join('') || '<div class="catalog-empty">No hay resultados.</div>')}</div>
        </div>
      </div>`;
    const catsPanel211 = grid.querySelector('.explore-cats');
    const subsPanel211 = grid.querySelector('.explore-subs');
    if(catsPanel211) catsPanel211.scrollTop = expCatsScroll211;
    if(subsPanel211) subsPanel211.scrollTop = expSubsScroll211;

    const input = document.getElementById('exploreFilter210');
    if(input){
      let timer; input.addEventListener('input',e=>{
        /* No reconstruir el modal entre pulsaciones: evita perder letras como
           'home' -> 'hmo' en equipos lentos. */
        expQuery=e.target.value;
        clearTimeout(timer);
        timer=setTimeout(()=>{
          requestAnimationFrame(()=>{
            renderExplore();
            requestAnimationFrame(()=>{
              const i=document.getElementById('exploreFilter210');
              if(i){ i.focus({preventScroll:true}); i.setSelectionRange(i.value.length,i.value.length); }
            });
          });
        },360);
      });
    }
    grid.querySelectorAll('.explore-cat').forEach(btn=>btn.addEventListener('click',()=>{
      const catsHost=grid.querySelector('.explore-cats');
      expCatsScroll211=catsHost ? catsHost.scrollTop : expCatsScroll211;
      expCat=btn.dataset.cat;
      const cc=currentCat();
      expSub=firstValidSub(cc);
      expQuery='';
      expSubsScroll211=0;
      renderExplore();
    }));
    grid.querySelectorAll('.explore-sub').forEach(btn=>btn.addEventListener('click',()=>{
      const catsHost=grid.querySelector('.explore-cats');
      const subsHost=grid.querySelector('.explore-subs');
      expCatsScroll211=catsHost ? catsHost.scrollTop : expCatsScroll211;
      expSubsScroll211=subsHost ? subsHost.scrollTop : expSubsScroll211;
      expSub=btn.dataset.sub;
      expQuery='';
      renderExplore();
      requestAnimationFrame(()=>{
        const restored=grid.querySelector('.explore-subs');
        if(restored) restored.scrollTop=expSubsScroll211;
        const products=grid.querySelector('.explore-products');
        if(products) products.scrollTop=0;
      });
    }));
    bindProductEvents(grid);
  }

  function abrirExplorar211(){
    const modal = document.getElementById('familiasModal');
    if(!modal) return;
    const title = document.getElementById('familiasTitle');
    if(title) title.textContent = 'Explorar catálogo';
    const p = modal.querySelector('.modal-head p');
    if(p) p.textContent = 'Navega por categoría y subfamilia para encontrar productos sin escribir referencias.';
    expCat = null;
    expSub = null;
    expQuery='';
    expCatsScroll211=0;
    expSubsScroll211=0;
    expMobileStep='cats';
    renderExplore();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
  }

  document.addEventListener('DOMContentLoaded',()=>{
    const btn = document.getElementById('btnFamilias');
    if(btn){
      btn.dataset.explorarPro='1'; btn.innerHTML = '<span class="btn-ico">🧭</span>Explorar';
      btn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); abrirExplorar211(); }, true);
    }
    document.querySelectorAll('.creator').forEach(el=>{ el.textContent = `· Creado por David Corregidor · ${VERSION_EXPLORE_211}`; });
  });
})();


/* =====================================================
   v2.1.3 PRO - Ajuste fino Explorador
   - Integración pasa a Intrusión.
   - SIM / antenas a Accesorios.
   - Storage/memoria ya no captura Bracket por el texto TF.
   - Botón y pie fijados como v2.1.3 PRO.
   ===================================================== */
(function(){
  function fixVersion213(){
    try{
      const b=document.getElementById('btnFamilias');
      if(b) b.innerHTML='<span class="btn-ico">🧭</span>Explorar';
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded',()=>{ fixVersion213(); setTimeout(fixVersion213,150); setTimeout(fixVersion213,700); });
})();

function descripcionPdfCorta(linea){
  try{
    const l = linea || {};
    const refOriginal = String(l.name || '').trim();
    const brandOriginal = String(l.brand || '').trim();
    const brandEsAjax = normaliza(brandOriginal) === 'ajax';
    // En el CSV, la columna brand contiene la descripción de los artículos no AJAX.
    // El PDF debe conservarla en lugar de fabricar una descripción desde la referencia.
    const descOriginal = String(l.desc || (!brandEsAjax ? brandOriginal : '') || '').trim();
    if(!refOriginal && descOriginal) return descOriginal.slice(0, 58);
    if(l.manual){ return (descOriginal || refOriginal || 'Línea manual').slice(0, 58); }
    if(descOriginal && !brandEsAjax){
      return descOriginal.length > 58 ? descOriginal.slice(0,55).trim() + '…' : descOriginal;
    }

    const ref = refOriginal.toUpperCase();

    function colorRef(r){
      if(/(^|[-_])W($|[-_])/.test(r)) return 'Blanco';
      if(/(^|[-_])B($|[-_])/.test(r)) return 'Negro';
      if(/(^|[-_])GRA($|[-_])/.test(r)) return 'Grafito';
      if(/(^|[-_])GRE($|[-_])/.test(r)) return 'Verde';
      if(/(^|[-_])IVO($|[-_])/.test(r)) return 'Marfil';
      if(/(^|[-_])OLI($|[-_])/.test(r)) return 'Oliva';
      if(/(^|[-_])FOG($|[-_])/.test(r)) return 'Niebla';
      if(/(^|[-_])OYS($|[-_])/.test(r)) return 'Ostra';
      return '';
    }

    const color = colorRef(ref);
    let base = ref.replace(/^AJ-/, '');

    const exactos = [
      [/^HUB2PLUS/, 'Hub 2 Plus'], [/^HUB2-4G/, 'Hub 2 4G'], [/^HUB2/, 'Hub 2'], [/^HUBBP/, 'Hub BP'], [/^HUB($|-)/, 'Hub'],
      [/^REX2/, 'ReX 2'], [/^REX($|-)/, 'ReX'],
      [/^MOTIONCAM-HDR-PHOD/, 'MotionCam HDR PhOD'], [/^MOTIONCAM-HDR/, 'MotionCam HDR'], [/^MOTIONCAMOUTDOOR.*PHOD/, 'MotionCam Outdoor PhOD'], [/^MOTIONCAMOUTDOOR/, 'MotionCam Outdoor'], [/^MOTIONCAM/, 'MotionCam'],
      [/^MOTIONPROTECTPLUS/, 'MotionProtect Plus'], [/^MOTIONPROTECT/, 'MotionProtect'], [/^OUTDOORPROTECT/, 'OutdoorProtect'],
      [/^DOORPROTECTPLUS/, 'DoorProtect Plus'], [/^DOORPROTECT/, 'DoorProtect'], [/^GLASSPROTECT/, 'GlassProtect'],
      [/^CURTAINCAM/, 'CurtainCam'], [/^DUALCURTAIN/, 'DualCurtain Outdoor'], [/^CURTAINOUTDOOR/, 'Curtain Outdoor'], [/^CURTAINPROTECT/, 'CurtainProtect'],
      [/^KEYPADTOUCHSCREEN/, 'KeyPad TouchScreen'], [/^KEYPADPLUS/, 'KeyPad Plus'], [/^KEYPADOUTDOOR/, 'KeyPad Outdoor'], [/^KEYPAD/, 'KeyPad'],
      [/^HOMESIREN/, 'HomeSiren'], [/^STREETSIRENCUSTOM/, 'StreetSiren Custom'], [/^STREETSIREN/, 'StreetSiren'],
      [/^FIREPROTECT2-HSC/, 'FireProtect 2 HSC'], [/^FIREPROTECT2-HS/, 'FireProtect 2 HS'], [/^FIREPROTECT2-HC/, 'FireProtect 2 HC'], [/^FIREPROTECT2-H/, 'FireProtect 2 H'], [/^FIREPROTECT2-C/, 'FireProtect 2 C'], [/^FIREPROTECTPLUS/, 'FireProtect Plus'], [/^FIREPROTECT/, 'FireProtect'],
      [/^LEAKSPROTECT/, 'LeaksProtect'], [/^WATERSTOP/, 'WaterStop'], [/^LIFEQUALITY-LITE/, 'LifeQuality Lite'], [/^LIFEQUALITY/, 'LifeQuality'],
      [/^BULLETCAM-(\d+)/, 'BulletCam $1 MP'], [/^DOMECAM-MINI-(\d+)/, 'DomeCam Mini $1 MP'], [/^DOMECAM-(\d+)/, 'DomeCam $1 MP'], [/^TURRETCAM-(\d+)/, 'TurretCam $1 MP'], [/^INDOORCAM-(\d+)/, 'IndoorCam $1 MP'], [/^DOORBELL-(\d+)/, 'DoorBell $1 MP'],
      [/^NVRKIT/, 'Kit NVR'], [/^NVR(\d+)/, 'NVR $1'],
      [/^LIGHTCORE-1G/, 'LightSwitch 1 tecla'], [/^LIGHTCORE-2G2W/, 'LightSwitch 2 teclas/2 vías'], [/^LIGHTCORE-2G/, 'LightSwitch 2 teclas'], [/^LIGHTCORE-2W/, 'LightSwitch 2 vías'], [/^LIGHTCORE-CROSS/, 'LightSwitch cruzamiento'], [/^LIGHTCORE-DIMMER/, 'Dimmer LightSwitch'],
      [/^SOCKET/, 'Socket'], [/^OUTLETCORE-SMART/, 'Outlet Core Smart'], [/^OUTLETCORE-LAN/, 'Outlet Core LAN'], [/^OUTLETCORE-BASIC/, 'Outlet Core Basic'], [/^RELAY/, 'Relay'], [/^WALLSWITCH/, 'WallSwitch'],
      [/^TRANSMITTER/, 'Transmitter'], [/^MULTITRANSMITTER/, 'MultiTransmitter'], [/^UARTBRIDGE/, 'uartBridge'], [/^OCBRIDGE/, 'ocBridge'], [/^VHFBRIDGE/, 'vhfBridge'],
      [/^SPACECONTROL/, 'SpaceControl'], [/^DOUBLEBUTTON/, 'DoubleButton'], [/^BUTTON/, 'Button'], [/^TAG/, 'Tag'], [/^PASS/, 'Pass'],
      [/^HD(\d+)TB/, 'Disco HDD $1 TB'], [/^HS[-_ ]?TF.*(128G)/, 'MicroSD 128 GB'], [/^HS[-_ ]?TF.*(64G)/, 'MicroSD 64 GB'], [/^HS[-_ ]?TF.*(32G)/, 'MicroSD 32 GB']
    ];

    let nombre = '';
    for(const [rx, val] of exactos){
      const m = ref.match(rx);
      if(m){ nombre = val.replace('$1', m[1] || ''); break; }
    }

    if(!nombre){
      nombre = base
        .replace(/-(B|W|GRA|GRE|IVO|OLI|FOG|OYS)(-|$)/g, '-')
        .replace(/-(DUMMY|BRACKET|LENS)$/g, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
    }

    const extras = [];
    if(/PHOD/.test(ref) && !/PHOD/i.test(nombre)) extras.push('PhOD');
    if(/HDR/.test(ref) && !/HDR/i.test(nombre)) extras.push('HDR');
    if(/HLVF/.test(ref)) extras.push('HLVF');
    if(/HL($|-)/.test(ref)) extras.push('HL');
    if(/4G/.test(ref) && !/4G/.test(nombre)) extras.push('4G');
    if(/POE/.test(ref)) extras.push('PoE');
    if(/AC($|-)/.test(ref)) extras.push('AC');

    let out = [nombre, ...extras, color].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
    if(!out) out = descOriginal || refOriginal;

    // Mantiene PDF compacto sin cortar referencias comerciales importantes.
    if(out.length > 52){
      out = out.replace(/\b(Jeweller|inalámbrico|inteligente|compatible|para sistemas Ajax)\b/gi,'').replace(/\s+/g,' ').trim();
    }
    if(out.length > 58) out = out.slice(0,55).trim() + '…';
    return out;
  }catch(e){
    return String((linea && (linea.desc || linea.name)) || 'Producto').slice(0,58);
  }
}


/* =====================================================
   3.0.0 - versión única
   ===================================================== */
(function(){
  const APP_VERSION = '4.0.7';
  function setAppVersion(){
    document.querySelectorAll('.creator').forEach(el=>{
      el.textContent = `· Creado por David Corregidor · ${APP_VERSION}`;
    });
  }
  window.actualizarVersionApp = setAppVersion;
  document.addEventListener('DOMContentLoaded', ()=>{
    setAppVersion();
    const target = document.querySelector('.creator');
    if(target){
      const observer = new MutationObserver(()=>{
        if(target.textContent !== `· Creado por David Corregidor · ${APP_VERSION}`) setAppVersion();
      });
      observer.observe(target,{childList:true,characterData:true,subtree:true});
    }
  }, {once:true});
})();

/* =====================================================
   v3.0.0 - Gestor de presupuestos: lista + vista previa
   Módulo aislado. No modifica Explorer, PDF ni cálculos.
   ===================================================== */
(function(){
  let pmSelectedId = '';
  const byId = id => document.getElementById(id);
  const pmModal = () => byId('pmModal');

  function pmRows(p){ return Array.isArray(p?.lineas) ? p.lineas.filter(l=>l && !l.separador && l.tipo!=='separador') : []; }
  function pmQty(l){ return Math.max(0, Number(l?.qty ?? l?.cantidad ?? l?.cant) || 0); }
  function pmProductName(l){ return String(l?.name ?? l?.nombre ?? l?.producto ?? l?.descripcion ?? l?.ref ?? 'Producto'); }
  function pmIdentifier(p){ return String(p?.identificador || p?.cliente || p?.numero || 'Sin identificar').trim(); }

  function pmCalc(p){
    const rows=pmRows(p); let base=0;
    rows.forEach(l=>{
      const pvp=Number(l.pvp)||0, qty=pmQty(l), dto=Math.min(100,Math.max(0,Number(l.dto ?? l.descuento)||0));
      base += pvp*qty*(1-dto/100);
    });
    const dtoGlobal=Math.min(100,Math.max(0,Number(p?.dtoGeneral)||0));
    base *= (1-dtoGlobal/100);
    const iva=Math.max(0,Number(p?.iva)||0);
    return {count:rows.length,base,total:base*(1+iva/100)};
  }

  function pmDate(value){
    if(!value) return 'Sin fecha';
    const d=new Date(value); if(Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d);
  }

  function pmSearchText(p){
    return [pmIdentifier(p),p?.numero,p?.cliente,p?.fecha,p?.guardado,p?.estado,p?.tienda,...pmRows(p).map(pmProductName)].filter(Boolean).join(' ').toLowerCase();
  }

  function pmSorted(){
    let list=leerListaPresupuestos().slice();
    const q=String(byId('pmSearch')?.value||'').trim().toLowerCase();
    if(q) list=list.filter(p=>q.split(/\s+/).every(part=>pmSearchText(p).includes(part)));
    const sort=byId('pmSort')?.value||'recent';
    if(sort==='identifier') list.sort((a,b)=>pmIdentifier(a).localeCompare(pmIdentifier(b),'es',{numeric:true}));
    else if(sort==='client') list.sort((a,b)=>String(a.cliente||'').localeCompare(String(b.cliente||''),'es'));
    else if(sort==='total') list.sort((a,b)=>pmCalc(b).total-pmCalc(a).total);
    else list.sort((a,b)=>String(b.guardado||b.fecha||'').localeCompare(String(a.guardado||a.fecha||'')));
    return list;
  }

  function pmSelected(){ return leerListaPresupuestos().find(p=>String(p.id)===String(pmSelectedId)); }
  function pmIsMobile(){ return window.matchMedia('(max-width:820px)').matches; }
  function pmMobileList(){ pmModal()?.classList.remove('pm-mobile-preview'); setTimeout(()=>byId('pmSearch')?.focus(),30); }
  function pmMobilePreview(){ if(pmIsMobile() && pmSelectedId) pmModal()?.classList.add('pm-mobile-preview'); }

  function pmRenderPreview(){
    const p=pmSelected(), preview=byId('pmPreview'), title=byId('pmPreviewTitle');
    const active=!!p;
    ['pmOpen','pmDuplicate','pmRename','pmDelete','pmExportOne'].forEach(id=>{const el=byId(id);if(el)el.disabled=!active;});
    if(!preview||!title) return;
    if(!p){
      title.textContent='Selecciona un presupuesto';
      preview.className='pmx-preview-body pmx-preview-empty';
      preview.innerHTML='<div class="pmx-empty-icon" aria-hidden="true">▤</div><strong>Selecciona un presupuesto</strong><p>Aquí verás el cliente, el total y los primeros productos antes de recuperarlo.</p>';
      return;
    }
    const c=pmCalc(p), rows=pmRows(p), shown=rows.slice(0,5);
    title.textContent=pmIdentifier(p);
    const products=shown.length ? shown.map(l=>`<li><span>${escapeHtml(pmProductName(l))}</span><b>x${pmQty(l)||1}</b></li>`).join('') : '<li class="pmx-no-products">Sin productos disponibles</li>';
    const extra=Math.max(0,rows.length-shown.length);
    preview.className='pmx-preview-body';
    preview.innerHTML=`
      <div class="pmx-identity">
        <span class="pmx-document-icon" aria-hidden="true">▤</span>
        <div><h4>${escapeHtml(pmIdentifier(p))}</h4><p>${escapeHtml(p.numero||'Sin número')}</p></div>
      </div>
      <dl class="pmx-meta">
        <div><dt>Cliente</dt><dd>${escapeHtml(p.cliente||'Sin cliente')}</dd></div>
        <div><dt>Guardado</dt><dd>${escapeHtml(pmDate(p.guardado||p.fecha))}</dd></div>
        <div><dt>Estado</dt><dd>${escapeHtml(p.estado||'Borrador')}</dd></div>
        <div><dt>Productos</dt><dd>${c.count}</dd></div>
      </dl>
      <div class="pmx-total"><span>Total</span><strong>${fmt.format(c.total)}</strong></div>
      <div class="pmx-products"><div class="pmx-products-title"><span>Primeros productos</span>${extra?`<small>+${extra} más</small>`:''}</div><ul>${products}</ul></div>`;
  }

  function pmRender(){
    const list=pmSorted(), all=leerListaPresupuestos(), root=byId('pmList');
    if(byId('pmCount')) byId('pmCount').textContent=`${all.length} ${all.length===1?'guardado':'guardados'}`;
    if(byId('pmVisibleCount')) byId('pmVisibleCount').textContent=`${list.length} visibles`;
    if(!root) return;
    if(pmSelectedId && !all.some(p=>String(p.id)===String(pmSelectedId))) pmSelectedId='';
    if(!list.length){ root.innerHTML='<div class="pmx-list-empty"><span>▤</span><strong>No hay presupuestos</strong><small>Prueba otra búsqueda o guarda el primero.</small></div>'; pmSelectedId=''; pmRenderPreview(); return; }
    root.innerHTML=list.map(p=>{
      const c=pmCalc(p), selected=String(p.id)===String(pmSelectedId);
      return `<button type="button" class="pmx-row${selected?' is-selected':''}" data-pm-id="${escapeHtml(String(p.id))}" role="option" aria-selected="${selected}">
        <span class="pmx-row-icon" aria-hidden="true">▤</span>
        <span class="pmx-row-main"><strong>${escapeHtml(pmIdentifier(p))}</strong><small>${escapeHtml(p.cliente||'Sin cliente')} · ${escapeHtml(p.numero||'Sin número')}</small></span>
        <span class="pmx-row-side"><strong>${fmt.format(c.total)}</strong><small>${c.count} productos</small></span>
      </button>`;
    }).join('');
    root.querySelectorAll('.pmx-row').forEach(row=>{
      row.addEventListener('click',()=>{pmSelectedId=row.dataset.pmId||'';const sel=byId('presupuestosGuardados');if(sel)sel.value=pmSelectedId;pmRender();pmMobilePreview();});
      row.addEventListener('dblclick',()=>{pmSelectedId=row.dataset.pmId||'';pmOpenSelected();});
    });
    pmRenderPreview();
  }

  function pmShow(){
    const modal=pmModal(); if(!modal)return;
    modal.classList.remove('hidden','pm-mobile-preview'); modal.setAttribute('aria-hidden','false');
    const current=byId('presupuestosGuardados')?.value||''; if(current) pmSelectedId=current;
    pmRender(); setTimeout(()=>byId('pmSearch')?.focus(),30);
  }
  function pmHide(){const modal=pmModal();if(modal){modal.classList.remove('pm-mobile-preview');modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');}}
  function pmOpenSelected(){const p=pmSelected();if(!p)return;const sel=byId('presupuestosGuardados');if(sel)sel.value=String(p.id);aplicarPresupuesto(p);pmHide();}
  function pmDuplicateSelected(){
    const p=pmSelected();if(!p)return;const copy=JSON.parse(JSON.stringify(p));
    copy.id=Date.now().toString();copy.numero=siguienteNumero(false);copy.identificador=`${pmIdentifier(p)} - copia`;copy.guardado=new Date().toISOString();copy.fecha=new Date().toISOString().slice(0,10);copy.estado='Borrador';
    const list=leerListaPresupuestos();list.unshift(copy);escribirListaPresupuestos(list.slice(0,100));refrescarPresupuestosGuardados();pmSelectedId=copy.id;pmRender();
  }
  function pmRenameSelected(){
    const p=pmSelected();if(!p)return;const value=prompt('Identificador del presupuesto:',pmIdentifier(p));if(value===null)return;const name=value.trim();if(!name)return;
    const list=leerListaPresupuestos(),i=list.findIndex(x=>String(x.id)===String(p.id));if(i<0)return;list[i].identificador=name;list[i].guardado=new Date().toISOString();escribirListaPresupuestos(list);refrescarPresupuestosGuardados();pmRender();
  }
  function pmExportOneSelected(){ const p=pmSelected(); if(p) exportarPresupuestoIndividual(p); }
  function pmDeleteSelected(){
    const p=pmSelected();if(!p)return;if(!confirm(`¿Eliminar "${pmIdentifier(p)}"?`))return;
    escribirListaPresupuestos(leerListaPresupuestos().filter(x=>String(x.id)!==String(p.id)));const sel=byId('presupuestosGuardados');if(sel)sel.value='';refrescarPresupuestosGuardados();pmSelectedId='';pmRender();
  }
  function pmToast(text){
    document.querySelector('.pmx-global-toast')?.remove();const t=document.createElement('div');t.className='pmx-global-toast';t.textContent=text;document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),220);},1500);
  }

  const pmGuardarBase=guardar;
  guardar=function(){
    if(!Array.isArray(lineas)||!lineas.some(l=>l&&!l.separador&&l.tipo!=='separador')){alert('Añade al menos un producto antes de guardar el presupuesto.');return;}
    const saved=byId('presupuestosGuardados'),selectedId=String(saved?.value||'');
    const existing=selectedId?leerListaPresupuestos().find(p=>String(p.id)===selectedId):null;
    let identifier=existing?.identificador||'';
    if(!identifier){
      const suggestion=String(byId('cliente')?.value||'').trim()||String(byId('numero')?.value||'').trim()||'Nuevo presupuesto';
      const value=prompt('Identificador del presupuesto\nEj.: Casa del pueblo, Oficina Madrid, Chalet García...',suggestion);
      if(value===null)return;identifier=value.trim()||suggestion;
    }
    const oldAlert=window.alert;window.alert=function(){};
    try{pmGuardarBase.apply(this,arguments);}finally{window.alert=oldAlert;}
    const id=String(saved?.value||'');const list=leerListaPresupuestos(),i=list.findIndex(p=>String(p.id)===id);
    if(i>=0){list[i].identificador=identifier;list[i].guardado=new Date().toISOString();escribirListaPresupuestos(list);refrescarPresupuestosGuardados();}
    pmToast(existing?'Presupuesto actualizado':'Presupuesto guardado');
    nuevoPresupuesto();setTimeout(()=>byId('cliente')?.focus(),30);
  };

  document.addEventListener('DOMContentLoaded',()=>{
    byId('btnBudgets')?.addEventListener('click',pmShow);byId('pmClose')?.addEventListener('click',pmHide);byId('pmCancel')?.addEventListener('click',pmHide);byId('pmBackdrop')?.addEventListener('click',pmHide);byId('pmBackMobile')?.addEventListener('click',pmMobileList);
    byId('pmSearch')?.addEventListener('input',pmRender);byId('pmSort')?.addEventListener('change',pmRender);byId('pmOpen')?.addEventListener('click',pmOpenSelected);byId('pmDuplicate')?.addEventListener('click',pmDuplicateSelected);byId('pmRename')?.addEventListener('click',pmRenameSelected);byId('pmExportOne')?.addEventListener('click',pmExportOneSelected);byId('pmDelete')?.addEventListener('click',pmDeleteSelected);byId('pmExport')?.addEventListener('click',exportarPresupuestos);byId('pmImport')?.addEventListener('click',()=>byId('pmImportFile')?.click());byId('pmImportFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importarPresupuestosArchivo(f);e.target.value='';});
    document.addEventListener('keydown',e=>{const modal=pmModal();if(modal?.classList.contains('hidden'))return;if(e.key==='Escape'){if(pmIsMobile()&&modal?.classList.contains('pm-mobile-preview'))pmMobileList();else pmHide();}});
    window.addEventListener('resize',()=>{if(!pmIsMobile())pmModal()?.classList.remove('pm-mobile-preview');});
    window.addEventListener('hiperajax:presupuestos-importados',()=>{pmSelectedId='';pmRender();});
  });
})();


/* =====================================================
   CATÁLOGO: CONTROL PROFESIONAL DE PRECIOS
   - Fuente única: catalogo_ajax.csv, solicitado sin caché.
   - Revisa catálogo, presupuesto abierto y TODOS los guardados.
   - Guarda huella y fecha de carga para identificar el catálogo usado.
   - El estado correcto es discreto; solo las incidencias son pulsables.
   ===================================================== */
const HX_CATALOG_DIAG_VERSION = '2.0';
const HX_CATALOG_META_KEY = 'hiperajax_catalogo_meta_v2';

function hxCatalogRef(value){
  return String(value || '').trim().toUpperCase();
}
function hxCatalogMoney(value){
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
function hxCatalogSamePrice(a, b){
  return Math.abs(hxCatalogMoney(a) - hxCatalogMoney(b)) < 0.005;
}
function hxCatalogHash(text){
  let hash = 2166136261;
  const value = String(text || '');
  for(let i=0;i<value.length;i++){
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8,'0');
}
function hxCatalogFingerprint(items){
  const rows = (Array.isArray(items) ? items : [])
    .map(p=>`${hxCatalogRef(p?.name)}|${hxCatalogMoney(p?.pvp).toFixed(2)}`)
    .sort();
  return hxCatalogHash(rows.join('\n'));
}
function hxCatalogDate(value){
  try{
    return new Intl.DateTimeFormat('es-ES',{dateStyle:'short',timeStyle:'short'}).format(new Date(value));
  }catch(e){ return String(value || ''); }
}
function hxBudgetLabel(p, index){
  const numero = String(p?.numero || '').trim();
  const cliente = String(p?.cliente || '').trim();
  const id = numero || cliente || `Presupuesto ${index + 1}`;
  return cliente && numero ? `${numero} · ${cliente}` : id;
}
function hxGetCatalogMeta(){
  try{
    const data = JSON.parse(localStorage.getItem(HX_CATALOG_META_KEY) || '{}');
    return data && typeof data === 'object' ? data : {};
  }catch(e){ return {}; }
}
function hxSaveCatalogMeta(meta){
  try{ localStorage.setItem(HX_CATALOG_META_KEY, JSON.stringify(meta || {})); }catch(e){}
}

function hxEnsureCatalogDiagnosticUI(){
  let status = document.getElementById('catalogHealth');
  if(!status){
    // Se usa un span y no un botón para evitar estilos verdes globales.
    // Solo se vuelve interactivo cuando existe una incidencia real.
    status = document.createElement('span');
    status.id = 'catalogHealth';
    status.className = 'catalog-health is-checking';
    status.hidden = true;
    status.setAttribute('aria-live', 'polite');
    const abrirDetalle = ()=>{
      const informe = window.HX_CATALOGO_DIAGNOSTICO;
      if(informe && informe.totalAvisos > 0) hxOpenCatalogDiagnostic();
    };
    status.addEventListener('click', abrirDetalle);
    status.addEventListener('keydown', e=>{
      if((e.key === 'Enter' || e.key === ' ') && status.getAttribute('role') === 'button'){
        e.preventDefault();
        abrirDetalle();
      }
    });
    const preview = document.getElementById('previewProducto');
    if(preview && preview.parentNode) preview.insertAdjacentElement('afterend', status);
  }

  if(!document.getElementById('catalogDiagnosticModal')){
    const modal = document.createElement('div');
    modal.id = 'catalogDiagnosticModal';
    modal.className = 'modal hidden catalog-diagnostic-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-backdrop" data-catalog-diagnostic-close></div>
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="catalogDiagnosticTitle">
        <div class="modal-head">
          <div>
            <h2 id="catalogDiagnosticTitle">Control de precios</h2>
            <p id="catalogDiagnosticSubtitle">Comprobación del catálogo y presupuestos guardados.</p>
          </div>
          <button type="button" class="modal-close" data-catalog-diagnostic-close aria-label="Cerrar">×</button>
        </div>
        <div id="catalogDiagnosticBody" class="catalog-diagnostic-body"></div>
        <div class="modal-foot">
          <button type="button" class="secondary" data-catalog-diagnostic-close>Entendido</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelectorAll('[data-catalog-diagnostic-close]').forEach(el=>el.addEventListener('click', hxCloseCatalogDiagnostic));
  }
  return status;
}
function hxOpenCatalogDiagnostic(){
  const modal = document.getElementById('catalogDiagnosticModal');
  if(!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
}
function hxCloseCatalogDiagnostic(){
  const modal = document.getElementById('catalogDiagnosticModal');
  if(!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  if(!document.querySelector('.modal:not(.hidden)')) document.body.classList.remove('modal-open');
}

function hxCompareLinesWithCatalog(lines, porRef){
  const diferencias = [];
  (Array.isArray(lines) ? lines : []).forEach((linea,index)=>{
    if(!linea || linea.manual || linea.separador) return;
    const ref = hxCatalogRef(linea.name);
    if(!ref) return;
    const vigente = porRef.get(ref);
    if(!vigente) return;
    if(!hxCatalogSamePrice(linea.pvp, vigente.pvp)){
      diferencias.push({
        ref,
        linea:index + 1,
        guardado:hxCatalogMoney(linea.pvp),
        catalogo:hxCatalogMoney(vigente.pvp),
        diferencia:hxCatalogMoney(vigente.pvp)-hxCatalogMoney(linea.pvp)
      });
    }
  });
  return diferencias;
}

function hxDiagnosticarCatalogo(opciones={}){
  hxEnsureCatalogDiagnosticUI();
  const abrirSiHayAvisos = opciones.abrirSiHayAvisos !== false;
  const avisarToast = opciones.avisarToast !== false;
  const porRef = new Map();
  const duplicados = [];
  const conflictosPrecio = [];

  (Array.isArray(productos) ? productos : []).forEach((p,index)=>{
    const ref = hxCatalogRef(p?.name);
    if(!ref) return;
    const actual={ref,pvp:hxCatalogMoney(p?.pvp),index,producto:p};
    if(!porRef.has(ref)){ porRef.set(ref,actual); return; }
    const anterior=porRef.get(ref);
    duplicados.push({ref,anterior,actual});
    if(!hxCatalogSamePrice(anterior.pvp,actual.pvp)) conflictosPrecio.push({ref,anterior:anterior.pvp,nuevo:actual.pvp});
  });

  const presupuestoActual = hxCompareLinesWithCatalog(lineas, porRef);
  const guardados = [];
  const listaGuardada = typeof leerListaPresupuestos === 'function' ? leerListaPresupuestos() : [];
  (Array.isArray(listaGuardada) ? listaGuardada : []).forEach((p,index)=>{
    const diferencias = hxCompareLinesWithCatalog(p?.lineas, porRef);
    if(diferencias.length){
      guardados.push({
        id:String(p?.id || ''),
        etiqueta:hxBudgetLabel(p,index),
        fecha:String(p?.fecha || p?.guardado || ''),
        diferencias
      });
    }
  });

  const fingerprint = hxCatalogFingerprint(productos);
  const anteriorMeta = hxGetCatalogMeta();
  const cargadoEn = new Date().toISOString();
  const catalogoCambio = Boolean(anteriorMeta.fingerprint && anteriorMeta.fingerprint !== fingerprint);
  const meta={
    version:HX_CATALOG_DIAG_VERSION,
    fuente:'catalogo_ajax.csv',
    fingerprint,
    cargadoEn,
    productos:Array.isArray(productos)?productos.length:0,
    referencias:porRef.size,
    anteriorFingerprint:String(anteriorMeta.fingerprint || ''),
    catalogoCambio
  };
  hxSaveCatalogMeta(meta);

  const lineasGuardadasAfectadas = guardados.reduce((n,p)=>n+p.diferencias.length,0);
  const totalAvisos = conflictosPrecio.length + presupuestoActual.length + lineasGuardadasAfectadas + (productos.length ? 0 : 1);
  const informe={
    ...meta,
    duplicados,
    conflictosPrecio,
    presupuestoActual,
    presupuestosGuardados:guardados,
    presupuestosGuardadosAfectados:guardados.length,
    lineasGuardadasAfectadas,
    totalAvisos
  };
  window.HX_CATALOGO_DIAGNOSTICO=informe;

  const status=document.getElementById('catalogHealth');
  const body=document.getElementById('catalogDiagnosticBody');
  const subtitle=document.getElementById('catalogDiagnosticSubtitle');
  if(!status || !body) return informe;

  status.classList.remove('is-checking','is-ok','is-warn','is-error');
  status.removeAttribute('aria-disabled');
  status.removeAttribute('title');
  status.removeAttribute('role');
  status.removeAttribute('tabindex');
  status.hidden = false;
  if(!productos.length){
    status.classList.add('is-error');
    status.textContent='Error de catálogo';
    status.title='Ver el problema';
    status.setAttribute('role','button');
    status.tabIndex=0;
  }else if(totalAvisos){
    status.classList.add('is-warn');
    status.textContent=`⚠ Revisar precios (${totalAvisos})`;
    status.title='Ver diferencias detectadas';
    status.setAttribute('role','button');
    status.tabIndex=0;
  }else{
    // Si todo está correcto no se añade ruido visual: queda únicamente
    // el contador normal de productos cargados que ya muestra la app.
    status.classList.add('is-ok');
    status.textContent='';
    status.hidden = true;
    status.setAttribute('aria-disabled','true');
  }

  if(subtitle) subtitle.textContent=`${informe.productos} productos · cargado ${hxCatalogDate(cargadoEn)} · control ${fingerprint}`;

  const bloques=[];
  bloques.push(`<section class="catalog-diag-summary ${totalAvisos?'has-warning':'is-clean'}">
    <strong>${totalAvisos?'Hay precios que conviene revisar':'Catálogo y presupuestos comprobados'}</strong>
    <span>${informe.productos} productos · ${informe.referencias} referencias · Fuente: ${escapeHtml(informe.fuente)}</span>
    <small>Cargado: ${escapeHtml(hxCatalogDate(cargadoEn))} · Identificador: ${escapeHtml(fingerprint)}</small>
  </section>`);

  if(catalogoCambio){
    bloques.push(`<section class="catalog-diag-section catalog-diag-info"><h3>Catálogo actualizado</h3>
      <p>La huella del catálogo ha cambiado desde la última carga. Se han vuelto a comprobar todos los presupuestos guardados.</p>
    </section>`);
  }
  if(conflictosPrecio.length){
    bloques.push(`<section class="catalog-diag-section"><h3>La misma referencia aparece con dos precios</h3>${conflictosPrecio.map(x=>`
      <div class="catalog-diag-item is-warning"><b>${escapeHtml(x.ref)}</b><span>${fmt.format(x.anterior)} frente a ${fmt.format(x.nuevo)}</span></div>`).join('')}</section>`);
  }
  if(presupuestoActual.length){
    bloques.push(`<section class="catalog-diag-section"><h3>Presupuesto abierto</h3>${presupuestoActual.map(x=>`
      <div class="catalog-diag-item is-warning"><b>${escapeHtml(x.ref)}</b><span>Línea ${x.linea}: ${fmt.format(x.guardado)} · Catálogo: ${fmt.format(x.catalogo)}</span></div>`).join('')}
      <p class="catalog-diag-help">No se cambia ningún precio automáticamente para no alterar un presupuesto sin tu permiso.</p></section>`);
  }
  if(guardados.length){
    bloques.push(`<section class="catalog-diag-section"><h3>Presupuestos guardados con precios distintos</h3>
      <p><b>${guardados.length}</b> presupuesto${guardados.length===1?'':'s'} · <b>${lineasGuardadasAfectadas}</b> línea${lineasGuardadasAfectadas===1?'':'s'} para revisar.</p>
      ${guardados.slice(0,30).map(p=>`<details class="catalog-diag-budget"><summary>${escapeHtml(p.etiqueta)} <span>${p.diferencias.length} diferencia${p.diferencias.length===1?'':'s'}</span></summary>
        ${p.diferencias.map(x=>`<div class="catalog-diag-item is-warning"><b>${escapeHtml(x.ref)}</b><span>${fmt.format(x.guardado)} → ${fmt.format(x.catalogo)}</span></div>`).join('')}
      </details>`).join('')}
      ${guardados.length>30?`<p class="catalog-diag-help">Se muestran los primeros 30 presupuestos afectados.</p>`:''}
    </section>`);
  }
  if(duplicados.length && !conflictosPrecio.length){
    bloques.push(`<section class="catalog-diag-section"><h3>Referencias repetidas</h3><p>${duplicados.length} referencia${duplicados.length===1?'':'s'} repetida${duplicados.length===1?'':'s'}, todas con el mismo precio.</p></section>`);
  }
  if(!totalAvisos && !duplicados.length){
    bloques.push(`<section class="catalog-diag-section"><p>No hay diferencias entre el catálogo actual, el presupuesto abierto y los presupuestos guardados.</p></section>`);
  }
  body.innerHTML=bloques.join('');

  if(totalAvisos && avisarToast){
    try{ hxToastGlobal(`${totalAvisos} precio${totalAvisos===1?'':'s'} para revisar`, 'error'); }catch(e){}
  }
  if(totalAvisos && abrirSiHayAvisos) hxOpenCatalogDiagnostic();
  return informe;
}

// Único envoltorio final de carga. La petición original ya usa cache:'no-store'
// y un parámetro temporal; después se registra la huella y se revisa todo.
const cargarCatalogo_BASE_DIAGNOSTICO = cargarCatalogo;
cargarCatalogo = async function(){
  const resultado = await cargarCatalogo_BASE_DIAGNOSTICO.apply(this, arguments);
  // Al arrancar no se abre ningún modal ni toast. Si existen diferencias,
  // queda visible el enlace ámbar para revisarlas cuando convenga.
  hxDiagnosticarCatalogo({abrirSiHayAvisos:false,avisarToast:false});
  return resultado;
};

// Mantener el control actualizado tras abrir, guardar, importar o borrar presupuestos.
function hxRefreshPriceControlSoon(){
  setTimeout(()=>{
    if(Array.isArray(productos) && productos.length) hxDiagnosticarCatalogo({abrirSiHayAvisos:false,avisarToast:false});
  },40);
}
['hiperajax:presupuestos-importados'].forEach(evt=>window.addEventListener(evt,hxRefreshPriceControlSoon));
const aplicarPresupuesto_BASE_DIAGNOSTICO = aplicarPresupuesto;
aplicarPresupuesto = function(){
  const r=aplicarPresupuesto_BASE_DIAGNOSTICO.apply(this,arguments);
  hxRefreshPriceControlSoon();
  return r;
};
const escribirListaPresupuestos_BASE_DIAGNOSTICO = escribirListaPresupuestos;
escribirListaPresupuestos = function(){
  const r=escribirListaPresupuestos_BASE_DIAGNOSTICO.apply(this,arguments);
  hxRefreshPriceControlSoon();
  return r;
};

document.addEventListener('DOMContentLoaded', hxEnsureCatalogDiagnosticUI);


/* =====================================================
   4.0.7 - Orden automático compartido de familias
   - Buscador inicial y catálogo: variantes W/B contiguas.
   - Mantiene la relevancia de cada familia y ordena sus variantes.
   - Si se busca negro/blanco, prioriza el color solicitado.
   ===================================================== */
(function(){
  const HX_APP_VERSION='4.0.7';
  function hxFamilyKey407(product){
    return String((product&&product.name)||'').toUpperCase()
      .replace(/-(?:W|B)(?=-|$)/g,'')
      .replace(/--+/g,'-').replace(/-$/,'').trim();
  }
  function hxColor407(product,query){
    const ref=String((product&&product.name)||'').toUpperCase();
    let order=/-W(?:-|$)/.test(ref)?0:/-B(?:-|$)/.test(ref)?1:2;
    const q=String(query||'').toLowerCase();
    if(/\b(?:negro|black)\b/.test(q)) order=/-B(?:-|$)/.test(ref)?0:/-W(?:-|$)/.test(ref)?1:2;
    return order;
  }
  function hxOrderFamilies407(items,query=''){
    if(!Array.isArray(items)||items.length<2) return items;
    const groups=new Map();
    items.forEach((item,pos)=>{
      const p=item&&item.p?item.p:item;
      const key=hxFamilyKey407(p);
      if(!groups.has(key)) groups.set(key,{key,items:[],best:-Infinity,first:pos});
      const g=groups.get(key);
      g.items.push({item,p,pos});
      g.best=Math.max(g.best,Number(item&&item.score)||0);
    });
    return [...groups.values()]
      .sort((a,b)=>(b.best-a.best)||(a.first-b.first)||a.key.localeCompare(b.key,'es',{numeric:true,sensitivity:'base'}))
      .flatMap(g=>g.items.sort((a,b)=>
        hxColor407(a.p,query)-hxColor407(b.p,query) ||
        (Number(b.item&&b.item.score)||0)-(Number(a.item&&a.item.score)||0) ||
        String(a.p&&a.p.name||'').localeCompare(String(b.p&&b.p.name||''),'es',{numeric:true,sensitivity:'base'})
      ).map(x=>x.item));
  }

  if(typeof buscar==='function'){
    const buscarBase407=buscar;
    buscar=function(term){ return hxOrderFamilies407(buscarBase407.apply(this,arguments),term); };
  }
  if(typeof buscarCatalogo==='function'){
    const buscarCatalogoBase407=buscarCatalogo;
    buscarCatalogo=function(term=''){ return hxOrderFamilies407(buscarCatalogoBase407.apply(this,arguments),term); };
  }

  function setVersion407(){
    document.querySelectorAll('.creator').forEach(el=>{
      el.textContent=`· Creado por David Corregidor · ${HX_APP_VERSION}`;
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{ setVersion407(); setTimeout(setVersion407,120); });
  const observer407=new MutationObserver(setVersion407);
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('.creator').forEach(el=>observer407.observe(el,{childList:true,characterData:true,subtree:true}));
  });
  window.HX_APP_VERSION=HX_APP_VERSION;
  window.HX_ORDER_FAMILIES=hxOrderFamilies407;
})();
