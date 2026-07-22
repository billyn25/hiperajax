/* =====================================================
   EXPLORAR_CONFIG.JS
   Edita SOLO este archivo para cambiar el explorador.

   MUY FÁCIL:
   - titulo: lo que ves en pantalla.
   - icono: emoji.
   - incluye: palabras que debe contener la referencia.
   - excluye: palabras que NO debe contener.
   - empieza: referencia que empieza por ese texto.
   - regex: patrones avanzados.

   IMPORTANTE:
   En esta versión incluye / empieza / regex / exactos funcionan como O.
   Ejemplo:
   incluye: ['storage'], regex: ['^HD\\d+TB']
   mete productos con storage O referencias tipo HD1TB, HD2TB, HD4TB...
   ===================================================== */

window.EXPLORAR_CATEGORIAS = [
  {
    id: 'intrusion',
    titulo: 'Intrusión',
    icono: '🏠',
    subcategorias: [
      { titulo: 'Hubs', icono: '🏠', regex: ['^AJ-(?:HUB-(?:W|B)|HUB2-(?:W|B)|HUB2-4G-(?:W|B)|HUB2PLUS-(?:W|B)|HUB2(?:-4G)?-DC6V-W|HUBBP-V2-(?:W|B|NOCASE))(?:\\s|$)'] },
      { titulo: 'Kits', icono: '📦', incluye: ['hubkit', 'hub2kit', 'starterkit'], excluye: ['repairkit'] },
      { titulo: 'MotionProtect', icono: '🚶', regex: ['^AJ-(?:MOTIONPROTECT(?:PLUS)?|OUTDOORPROTECT|COMBIPROTECT)-(?:W|B)(?:\\s|$)'] },
      { titulo: 'MotionCam', icono: '📷', incluye: ['motioncam'], excluye: ['dummy', 'lens', 'hood', 'bracket'] },
      { titulo: 'DoorProtect', icono: '🚪', regex: ['^AJ-DOORPROTECT(?:PLUS)?-(?:W|B)(?:\\s|$)'] },
      { titulo: 'GlassProtect', icono: '🪟', incluye: ['combiprotect'], regex: ['^AJ-GLASSPROTECT-(?:W|B)(?:\\s|$)'],excluye: ['dummy'] },
      { titulo: 'Curtain', icono: '🟢', incluye: ['curtainprotect', 'curtainoutdoor', 'dualcurtain', 'curtaincam'], excluye: ['dummy', 'bracket'] },
      { titulo: 'Repetidores', icono: '📡', regex: ['^AJ-REX2?-(?:W|B)(?:-NF)?(?:\\s|$)'] },
      { titulo: 'Teclados', icono: '⌨️', incluye: ['keypad'], excluye: ['dummy', 'bracket'] },
      { titulo: 'Sirenas', icono: '📢', incluye: ['homesiren', 'streetsiren'], excluye: ['dummy', 'bracket', 'speakerss'] },
      { titulo: 'Audio / Voz', icono: '🔊', incluye: ['speakerphone'] },
      { titulo: 'Mandos / Botones', icono: '🎛️', incluye: ['spacecontrol', 'button', 'doublebutton','aj-holder'], excluye: ['centerbutton', 'sidebutton', 'solobutton', 'dummy']},
      { titulo: 'Enchufes inteligentes', icono: '⚡', incluye: ['socket'], excluye: ['sim', 'cover', 'button'] },
      { titulo: 'Transmisores', icono: '🧠', incluye: ['transmitter', 'uartbridge', 'ocbridge', 'vhfbridge'], excluye: ['dummy', 'bracket', 'case'] },
      { titulo: 'Relés', icono: '⚙️', incluye: ['relay', 'wallswitch', 'multirelay','dinholder'] },
      { titulo: 'Tarjetas / Llaveros', icono: '🔐', incluye: ['pass', 'tag'], excluye: ['keypad', 'keymcp','bypass']},
    ]
  },

  {
    id: 'video',
    titulo: 'Videovigilancia',
    icono: '📷',
    subcategorias: [
      { titulo: 'Bullet', icono: '📷', incluye: ['bulletcam'], excluye: ['bracket', 'mountcam', 'junctionbox', 'hood', 'cover', 'frame', 'storage', 'psu', 'pcb'] },
      { titulo: 'Domo', icono: '📷', incluye: ['domecam'], excluye: ['bracket', 'mountcam', 'junctionbox', 'hood', 'cover', 'frame', 'storage', 'psu', 'pcb'] },
      { titulo: 'Turret', icono: '📷', incluye: ['turretcam'], excluye: ['bracket', 'mountcam', 'junctionbox', 'hood', 'cover', 'frame', 'storage', 'psu', 'pcb'] },
      { titulo: 'IndoorCam', icono: '🏠', incluye: ['indoorcam'], excluye: ['bracket', 'mountcam', 'junctionbox', 'hood', 'cover', 'frame', 'storage', 'psu', 'pcb'] },
      { titulo: 'DoorBell', icono: '🚪', incluye: ['doorbell'], excluye: ['bracket', 'mountcam', 'junctionbox', 'hood', 'cover', 'frame', 'storage', 'psu', 'pcb'] },
      { titulo: 'NVR', icono: '🎥', incluye: ['nvr'], excluye: ['nvrkit', 'psu', 'storage'] },
      { titulo: 'Kits NVR', icono: '📦', incluye: ['nvrkit'] },
      { titulo: 'Discos HDD / SD', icono: '💽', incluye: ['hd1tb', 'hd2tb', 'hd4tb', 'hd6tb', 'hd8tb', 'hs-tf'], regex: ['^HD\\d+TB', '^HS[-_ ]?TF'] },
      { titulo: 'Soporte Cámaras', icono: '🧰', incluye: ['junctionbox'] },
    ]
  },

  {
    id: 'domotica',
    titulo: 'Domótica',
    icono: '💡',
    subcategorias: [
      { titulo: 'Enchufes inteligentes', icono: '⚡', incluye: ['socket'], excluye: ['sim', 'cover', 'button'] },
      { titulo: 'Interruptores de luz', icono: '💡', incluye: ['lightcore', 'lightswitch'], excluye: ['centerbutton', 'sidebutton', 'solobutton', 'frame', 'cover'] },
      { titulo: 'Botones LightSwitch', icono: '🎛️', incluye: ['centerbutton', 'sidebutton', 'solobutton'] },
      { titulo: 'Bases de enchufe', icono: '🔌', incluye: ['outletcore', 'outletbasic', 'outletlan', 'outlet'], excluye: ['cover', 'socket'] },
      { titulo: 'Tapas enchufe', icono: '🧩', incluye: ['centercover', 'sidecover', 'solocover', 'coverplate', 'bypass-dimmer', 'bypassdimmer'] },
      { titulo: 'Marcos', icono: '🖼️', incluye: ['frame'], excluye: ['case'] },
      { titulo: 'Caja de superficie', icono: '📦', incluye: ['surfacebox'] },
      { titulo: 'Relés', icono: '⚙️', incluye: ['relay', 'wallswitch', 'multirelay'], excluye: ['dinholder'] }
    ]
  },

  {
    id: 'incendio_seguridad',
    titulo: 'Incendio / Seguridad',
    icono: '🔥',
    subcategorias: [
      { titulo: 'Detectores', icono: '🔥', incluye: ['fireprotect'], excluye: ['dummy', 'bracket'] },
      { titulo: 'Botón incendio', icono: '🚨', incluye: ['manualcallpoint', 'keymcp'] },
      { titulo: 'Inundación', icono: '💧', incluye: ['leaksprotect', 'inundacion'] },
      { titulo: 'Electroválvula', icono: '🚰', incluye: ['waterstop'] },
      { titulo: 'LifeQuality', icono: '🌡️', incluye: ['lifequality'] }
    ]
  },
  {
    id: 'redes',
    titulo: 'Redes',
    icono: '🌐',
    subcategorias: [
      { titulo: 'Switches', icono: '🔀', incluye: ['switch'], excluye: ['wallswitch', 'reedswitch', 'lightswitch'] },
      { titulo: 'Routers', icono: '📡', incluye: ['router'] },
      { titulo: 'Puntos de acceso', icono: '📶', incluye: ['access point', 'punto de acceso', 'wifi ap', 'ap wifi'] },
      { titulo: 'Inyectores PoE', icono: '⚡', incluye: ['injector poe', 'inyector poe', 'inj-poe'] },
      { titulo: 'Conversores', icono: '🔄', incluye: ['media converter', 'converter', 'conversor'] },
      { titulo: 'Rack / Patch panel', icono: '🗄️', incluye: ['rack', 'patch panel', 'patchpanel', 'panel de parcheo'], excluye: ['bracket']},
    ]
  },

  {
  id: 'accesorios',
  titulo: 'Accesorios',
  icono: '🧰',
     subcategorias: [
        {
  titulo: 'Soportes',
  icono: '🧰',
  incluye: [
    'junctionbox',
    'mountcam',
    'hood',
  ], excluye: ['lens','protect','bracket'] },
      { titulo: 'Carcasas / Dummy', icono: '📦', incluye: ['dummy']},
      { titulo: 'Tapas / Covers / Frame', icono: '🧩', incluye: ['cover', 'coverplate', 'frame', 'surfacebox','coverholder'], excluye: ['cap'] },
     { titulo: 'Fuentes / Baterías', icono: '🔋', incluye: ['psu','battery','hubbatt','ac220','dc12','dc6','dc1224','internalbattery','batt-cr123a','cr123a','cr2032','er14505'], excluye: ['bracket','hub2'] },
      { titulo: 'SAI / UPS', icono: '🔌', incluye: ['sai', 'ups'], regex: ['^SAI', '^UPS'] },
      { titulo: 'SIM / Antenas', icono: '📶', regex: ['^AJ-(?:SIM|SIMSLOT|EXTERNALANTENNA-B)(?:\\s|$)', '^LXM2M-CARD-ES(?:\\s|$)'] },
      { titulo: 'Recambios', icono: '🧲', incluye: ['magnet', 'reedswitch', 'lens', 'repairkit','ledstrips','MINIHUB','speakerss','bracket','magnet',], excluye: [ 'storage','doorprotect'] },
      { titulo: 'Storage / Memorias', icono: '💾', incluye: ['storage', 'hstd', 'hdd', 'microsd', 'micro-sd'], regex: ['^HS[-_ ]?TF', '^HD\\d+TB'], excluye: ['bracket', 'mountcam', 'junctionbox', 'hood', 'cover', 'frame'] },
      { titulo: 'Cajas / Canalización', icono: '📦', incluye: ['caja estanca', 'fmcs57', 'fmcs60'] },
      { titulo: 'Barreras infrarrojas', icono: '🚧', incluye: ['detector de barrera', 'barrera por infrarrojos'], exactos: ['ABE-150'] },
      { titulo: 'Marketing / Demos', icono: '👕', incluye: ['polo', 'tshirt', 'baseball', 'brandplate', 'cup','cap','totem', 'democase','case','suitcase'] }
    ]
  }
];
