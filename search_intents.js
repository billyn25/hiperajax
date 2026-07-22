/* ============================================================
   SEARCH_INTENTS.JS — orden comercial por familias

   Edita este archivo para decidir qué familia debe salir primero
   cuando una búsqueda es genérica. No contiene lógica del motor.

   aliases : búsquedas que activan la intención (coincidencia exacta)
   include : regex de productos válidos para esa intención
   exclude : regex de accesorios/variantes que no deben aparecer
   tiers   : orden de familias. El primer patrón tiene prioridad.
   ============================================================ */
window.HXA_SEARCH_INTENTS = [
  {
    id:'hub2',
    aliases:['hub2','hub 2'],
    include:'^AJ-HUB',
    exclude:'KIT|DUMMY|BATTERY|BATT|BRACKET|MINIHUB|HUBBP|NOCASE|DC6V',
    tiers:[
      '^AJ-HUB2-[WB]$',
      '^AJ-HUB2PLUS-[WB]$',
      '^AJ-HUB2-4G-[WB]$',
      '^AJ-HUB-[WB]$'
    ]
  },
  {
    id:'hub',
    aliases:['hub','central','central alarma'],
    include:'^AJ-HUB',
    exclude:'KIT|DUMMY|BATTERY|BATT|BRACKET|MINIHUB|HUBBP|NOCASE|DC6V',
    tiers:[
      '^AJ-HUB2-[WB]$',
      '^AJ-HUB2-4G-[WB]$',
      '^AJ-HUB2PLUS-[WB]$',
      '^AJ-HUB-[WB]$'
    ]
  },
  {
    id:'motion',
    aliases:['motion','movimiento','detector movimiento','sensor movimiento'],
    include:'MOTIONPROTECT|MOTIONCAM|OUTDOORPROTECT|CURTAINPROTECT|CURTAINOUTDOOR|DUALCURTAIN',
    exclude:'DUMMY|LENS|HOOD|BRACKET',
    tiers:[
      '^AJ-MOTIONPROTECT-[WB]$',
      '^AJ-MOTIONPROTECTPLUS-[WB]$',
      '^AJ-MOTIONCAM-HDR-[WB]$',
      '^AJ-MOTIONCAM-HDR-PHOD-[WB]$',
      '^AJ-MOTIONCAMOUTDOOR-W$',
      '^AJ-MOTIONCAMOUTDOOR-PHOD-W$',
      '^AJ-MOTIONCAMOUTDOOR-HIGHMOUNT-PHOD-W$',
      'OUTDOORPROTECT',
      'CURTAINPROTECT|CURTAINOUTDOOR|DUALCURTAIN'
    ]
  },
  {
    id:'motioncam',
    aliases:['motioncam','motion cam','motcam','mocam','mcam','fotosensor','foto sensor','detector con foto'],
    include:'MOTIONCAM',
    exclude:'DUMMY|LENS|HOOD|BRACKET',
    tiers:[
      '^AJ-MOTIONCAM-HDR-[WB]$',
      '^AJ-MOTIONCAM-HDR-PHOD-[WB]$',
      '^AJ-MOTIONCAMOUTDOOR-W$',
      '^AJ-MOTIONCAMOUTDOOR-PHOD-W$',
      '^AJ-MOTIONCAMOUTDOOR-HIGHMOUNT-PHOD-W$'
    ]
  },
  {
    id:'door',
    aliases:['door','puerta','ventana','apertura','contacto magnetico'],
    include:'^AJ-DOORPROTECT',
    exclude:'DUMMY|MAGNET',
    tiers:['^AJ-DOORPROTECT-[WB]$','^AJ-DOORPROTECTPLUS-[WB]$']
  },
  {
    id:'fire',
    aliases:['fire','humo','fuego','incendio','detector humo'],
    include:'FIREPROTECT',
    exclude:'DUMMY|BRACKET',
    tiers:['^AJ-FIREPROTECT2-[WB]$','^AJ-FIREPROTECT2-PLUS-[WB]$','^AJ-FIREPROTECT-[WB]$']
  },
  {
    id:'keypad',
    aliases:['keypad','teclado'],
    include:'KEYPAD',
    exclude:'DUMMY|BRACKET|HOLDER',
    tiers:['^AJ-KEYPAD-[WB]$','^AJ-KEYPADPLUS-[WB]$','^AJ-KEYPADTOUCHSCREEN-[WB]$']
  },
  {
    id:'rex',
    aliases:['rex','repetidor','amplificador señal'],
    include:'REX2|AJ-REX(?:-|$)',
    exclude:'BRACKET|BATTERY|PSU|DUMMY',
    tiers:['^AJ-REX2-[WB]$','^AJ-REX-[WB]$']
  }
];

/* Familias adicionales: orden comercial reutilizable y fácil de mantener. */
window.HXA_SEARCH_INTENTS.push(
  {
    id:'glass',
    aliases:['glass','glassprotect','cristal','rotura cristal','detector cristal'],
    include:'^AJ-GLASSPROTECT',
    exclude:'DUMMY|BRACKET',
    tiers:['^AJ-GLASSPROTECT-[WB]$']
  },
  {
    id:'leaks',
    aliases:['leaks','leaksprotect','agua','inundacion','inundación','fuga agua','detector agua'],
    include:'^AJ-LEAKSPROTECT',
    exclude:'DUMMY|BRACKET',
    tiers:['^AJ-LEAKSPROTECT-[WB]$']
  },
  {
    id:'siren',
    aliases:['sirena','sirenas'],
    include:'HOMESIREN|STREETSIREN',
    exclude:'DUMMY|BRACKET|HOLDER',
    tiers:['^AJ-HOMESIREN-[WB]$','^AJ-STREETSIREN-[WB]$','^AJ-STREETSIRENCUSTOM-[WB]$']
  },
  {
    id:'siren_in',
    aliases:['sirena interior','sirena interna','homesiren','home siren'],
    include:'^AJ-HOMESIREN',
    exclude:'DUMMY|BRACKET|HOLDER',
    tiers:['^AJ-HOMESIREN-[WB]$']
  },
  {
    id:'siren_out',
    aliases:['sirena exterior','sirena externa','streetsiren','street siren'],
    include:'^AJ-STREETSIREN',
    exclude:'DUMMY|BRACKET|HOLDER',
    tiers:['^AJ-STREETSIREN-[WB]$','^AJ-STREETSIRENCUSTOM-[WB]$']
  },
  {
    id:'camera',
    aliases:['camara','cámara','camaras','cámaras','camera','cctv'],
    include:'^AJ-(DOMECAM|TURRETCAM|BULLETCAM)',
    exclude:'JUNCTIONBOX|BRACKET|MOUNTCAM|HOOD|DUMMY',
    tiers:[
      '^AJ-DOMECAM-MINI-5-(?:B|W)$',
      '^AJ-TURRETCAM-5-(?:B|W)$',
      '^AJ-BULLETCAM-5-(?:B|W)$',
      '^AJ-DOMECAM-MINI-8-(?:B|W)$',
      '^AJ-TURRETCAM-8-(?:B|W)$',
      '^AJ-BULLETCAM-8-(?:B|W)$',
      '^AJ-DOMECAM',
      '^AJ-TURRETCAM',
      '^AJ-BULLETCAM'
    ]
  },
  {
    id:'dome',
    aliases:['domo','dome','domecam','camara domo','cámara domo'],
    include:'^AJ-DOMECAM',
    exclude:'JUNCTIONBOX|BRACKET|MOUNTCAM|HOOD|DUMMY',
    tiers:['^AJ-DOMECAM-MINI-5-(?:B|W)$','^AJ-DOMECAM-MINI-8-(?:B|W)$','^AJ-DOMECAM-5','^AJ-DOMECAM-8']
  },
  {
    id:'turret',
    aliases:['turret','turretcam','torreta','camara turret','cámara turret'],
    include:'^AJ-TURRETCAM',
    exclude:'JUNCTIONBOX|BRACKET|MOUNTCAM|HOOD|DUMMY',
    tiers:['^AJ-TURRETCAM-5-(?:B|W)$','^AJ-TURRETCAM-8-(?:B|W)$','^AJ-TURRETCAM-5','^AJ-TURRETCAM-8']
  },
  {
    id:'bullet',
    aliases:['bullet','bulletcam','bala','camara bala','cámara bala'],
    include:'^AJ-BULLETCAM',
    exclude:'JUNCTIONBOX|BRACKET|MOUNTCAM|HOOD|DUMMY',
    tiers:['^AJ-BULLETCAM-5-(?:B|W)$','^AJ-BULLETCAM-8-(?:B|W)$','^AJ-BULLETCAM-5','^AJ-BULLETCAM-8']
  },
  {
    id:'nvr8',
    aliases:['nvr8','nvr 8','grabador 8','grabador 8 canales','8 canales'],
    include:'^AJ-NVR(?:108|208)',
    exclude:'KIT',
    tiers:['^AJ-NVR108-HAC-[WB]$','^AJ-NVR108-[WB]$','^AJ-NVR208-HAC-[WB]$','^AJ-NVR208']
  },
  {
    id:'nvr16',
    aliases:['nvr16','nvr 16','grabador 16','grabador 16 canales','16 canales'],
    include:'^AJ-NVR(?:116|216)',
    exclude:'KIT',
    tiers:['^AJ-NVR116-HAC-[WB]$','^AJ-NVR116-[WB]$','^AJ-NVR216-HAC-[WB]$','^AJ-NVR216']
  },
  {
    id:'relay',
    aliases:['relay','rele','relé','reles','relés'],
    include:'^AJ-(RELAY|WALLSWITCH)',
    exclude:'DINHOLDER|BRACKET|DUMMY',
    tiers:['^AJ-RELAY$','^AJ-WALLSWITCH$']
  },
  {
    id:'socket',
    aliases:['socket','enchufe','enchufe inteligente'],
    include:'^AJ-SOCKET',
    exclude:'DUMMY|BRACKET',
    tiers:['^AJ-SOCKET-W$','^AJ-SOCKET-B$','^AJ-SOCKET-G-W$']
  }
);
