/* =====================================================
   PDF_DESC_CONFIG.JS
   Edita SOLO este archivo para cambiar las descripciones
   comerciales abreviadas que salen en el PDF.

   - titulo: texto que quieres ver en el PDF.
   - match: palabras que debe contener la referencia.
   - Si no hay coincidencia, la app usa su abreviado automático.
   - El color se añade automáticamente si la referencia termina en -W, -B,
     -GRA, -GRE, -IVO, -OLI, -FOG u -OYS.
   ===================================================== */

window.PDF_DESC_CONFIG = [
  // Hubs
  { titulo: 'Hub 2 Plus Jeweller', match: ['hub2plus'] },
  { titulo: 'Hub 2 4G Jeweller', match: ['hub2-4g'] },
  { titulo: 'Hub 2 Jeweller', match: ['hub2'] },
  { titulo: 'Hub BP Jeweller', match: ['hubbp'] },
  { titulo: 'Hub Jeweller', match: ['aj-hub'] },
  { titulo: 'ReX 2 Jeweller', match: ['rex2'] },
  { titulo: 'ReX Jeweller', match: ['rex'] },

  // Intrusión
  { titulo: 'MotionCam HDR PhOD', match: ['motioncam-hdr-phod'] },
  { titulo: 'MotionCam HDR', match: ['motioncam-hdr'] },
  { titulo: 'MotionCam Outdoor PhOD', match: ['motioncamoutdoor', 'phod'] },
  { titulo: 'MotionCam Outdoor', match: ['motioncamoutdoor'] },
  { titulo: 'MotionCam', match: ['motioncam'] },
  { titulo: 'MotionProtect Plus', match: ['motionprotectplus'] },
  { titulo: 'MotionProtect', match: ['motionprotect'] },
  { titulo: 'OutdoorProtect', match: ['outdoorprotect'] },
  { titulo: 'DoorProtect Plus', match: ['doorprotectplus'] },
  { titulo: 'DoorProtect', match: ['doorprotect'] },
  { titulo: 'GlassProtect', match: ['glassprotect'] },
  { titulo: 'CurtainCam', match: ['curtaincam'] },
  { titulo: 'DualCurtain Outdoor', match: ['dualcurtain'] },
  { titulo: 'Curtain Outdoor', match: ['curtainoutdoor'] },
  { titulo: 'CurtainProtect', match: ['curtainprotect'] },

  // Teclados / sirenas / mandos
  { titulo: 'KeyPad TouchScreen', match: ['keypadtouchscreen'] },
  { titulo: 'KeyPad Plus', match: ['keypadplus'] },
  { titulo: 'KeyPad Outdoor', match: ['keypadoutdoor'] },
  { titulo: 'KeyPad', match: ['keypad'] },
  { titulo: 'HomeSiren', match: ['homesiren'] },
  { titulo: 'StreetSiren Custom', match: ['streetsirencustom'] },
  { titulo: 'StreetSiren', match: ['streetsiren'] },
  { titulo: 'SpaceControl', match: ['spacecontrol'] },
  { titulo: 'DoubleButton', match: ['doublebutton'] },
  { titulo: 'Button', match: ['button'] },
  { titulo: 'Tag', match: ['tag'] },
  { titulo: 'Pass', match: ['pass'] },

  // Incendio / inundación
  { titulo: 'FireProtect 2 HSC', match: ['fireprotect2-hsc'] },
  { titulo: 'FireProtect 2 HS', match: ['fireprotect2-hs'] },
  { titulo: 'FireProtect 2 HC', match: ['fireprotect2-hc'] },
  { titulo: 'FireProtect 2 H', match: ['fireprotect2-h'] },
  { titulo: 'FireProtect 2 C', match: ['fireprotect2-c'] },
  { titulo: 'FireProtect Plus', match: ['fireprotectplus'] },
  { titulo: 'FireProtect', match: ['fireprotect'] },
  { titulo: 'ManualCallPoint', match: ['manualcallpoint'] },
  { titulo: 'LeaksProtect', match: ['leaksprotect'] },
  { titulo: 'WaterStop', match: ['waterstop'] },
  { titulo: 'LifeQuality Lite', match: ['lifequality-lite'] },
  { titulo: 'LifeQuality', match: ['lifequality'] },

  // Vídeo
  { titulo: 'BulletCam', match: ['bulletcam'] },
  { titulo: 'DomeCam Mini', match: ['domecam-mini'] },
  { titulo: 'DomeCam', match: ['domecam'] },
  { titulo: 'TurretCam', match: ['turretcam'] },
  { titulo: 'IndoorCam', match: ['indoorcam'] },
  { titulo: 'DoorBell', match: ['doorbell'] },
  { titulo: 'Kit NVR', match: ['nvrkit'] },
  { titulo: 'NVR', match: ['nvr'] },

  // Domótica
  { titulo: 'LightSwitch 2 teclas/2 vías', match: ['lightcore-2g2w'] },
  { titulo: 'LightSwitch 2 teclas', match: ['lightcore-2g'] },
  { titulo: 'LightSwitch 2 vías', match: ['lightcore-2w'] },
  { titulo: 'LightSwitch 1 tecla', match: ['lightcore-1g'] },
  { titulo: 'LightSwitch cruzamiento', match: ['lightcore-cross'] },
  { titulo: 'Dimmer LightSwitch', match: ['lightcore-dimmer'] },
  { titulo: 'Socket', match: ['socket'] },
  { titulo: 'Outlet Core Smart', match: ['outletcore-smart'] },
  { titulo: 'Outlet Core LAN', match: ['outletcore-lan'] },
  { titulo: 'Outlet Core Basic', match: ['outletcore-basic'] },
  { titulo: 'Relay', match: ['relay'] },
  { titulo: 'WallSwitch', match: ['wallswitch'] },

  // Accesorios importantes para PDF
  { titulo: 'Soporte MotionProtect', match: ['bracketmp'] },
  { titulo: 'Soporte MotionCam', match: ['bracketm'] },
  { titulo: 'Soporte DoorProtect', match: ['bracketdp'] },
  { titulo: 'Soporte FireProtect', match: ['bracketfp'] },
  { titulo: 'Soporte KeyPad', match: ['bracketkp'] },
  { titulo: 'Soporte HomeSiren', match: ['brackeths'] },
  { titulo: 'Soporte Hub', match: ['brackethub'] },
  { titulo: 'Soporte', match: ['bracket'] },
  { titulo: 'Carcasa Dummy MotionCam', match: ['motioncam', 'dummy'] },
  { titulo: 'Carcasa Dummy MotionProtect', match: ['motionprotect', 'dummy'] },
  { titulo: 'Carcasa Dummy DoorProtect', match: ['doorprotect', 'dummy'] },
  { titulo: 'Carcasa Dummy FireProtect', match: ['fireprotect', 'dummy'] },
  { titulo: 'Carcasa Dummy', match: ['dummy'] },
  { titulo: 'Visera MotionCam Outdoor', match: ['hood-motioncamoutdoor'] },
  { titulo: 'Visera', match: ['hood'] },
  { titulo: 'Caja conexiones', match: ['junctionbox'] },
  { titulo: 'Caja superficie', match: ['surfacebox'] },
  { titulo: 'Marco', match: ['frame'] },
  { titulo: 'Tapa embellecedora', match: ['coverplate'] },
  { titulo: 'Tapa central', match: ['centercover'] },
  { titulo: 'Tapa lateral', match: ['sidecover'] },
  { titulo: 'Tapa simple', match: ['solocover'] },
  { titulo: 'Botón central', match: ['centerbutton'] },
  { titulo: 'Botón lateral', match: ['sidebutton'] },
  { titulo: 'Botón simple', match: ['solobutton'] },
  { titulo: 'Lente recambio', match: ['lens'] },
  { titulo: 'Imán', match: ['magnet'] },
  { titulo: 'ReedSwitch', match: ['reedswitch'] },
  { titulo: 'Fuente alimentación', match: ['psu'] },
  { titulo: 'Batería', match: ['battery'] },
  { titulo: 'Placa alimentación AC', match: ['ac220'] },
  { titulo: 'Placa alimentación DC', match: ['dc12'] },

  // Storage / memorias
  { titulo: 'Disco HDD', match: ['hd'] },
  { titulo: 'MicroSD', match: ['hs-tf'] }
];
