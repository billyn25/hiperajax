/* =====================================================
   PDF_DESC_CONFIG.JS
   Descripciones comerciales breves para la columna
   "Descripción" del PDF.

   - titulo: texto corto y útil (máximo una línea).
   - match: fragmentos que debe contener la referencia.
   - Gana la regla más específica (más coincidencias).
   - El color se añade automáticamente desde la referencia.
   - Si no hay regla, la app conserva su abreviado automático.
   ===================================================== */

window.PDF_DESC_CONFIG = [
  // Centrales y repetidores
  { titulo: 'Central con Wi-Fi, 4G y hasta 200 dispositivos', match: ['hub2plus'] },
  { titulo: 'Central 4G con fotoverificación y 2 SIM', match: ['hub2-4g'] },
  { titulo: 'Central con fotoverificación y doble SIM 2G', match: ['hub2'] },
  { titulo: 'Central sin red eléctrica para ubicaciones remotas', match: ['hubbp'] },
  { titulo: 'Central básica Ethernet y GPRS', match: ['aj-hub'] },
  { titulo: 'Repetidor compatible con detectores con foto', match: ['rex2'] },
  { titulo: 'Repetidor de señal Jeweller', match: ['rex'] },

  // Detectores de intrusión
  { titulo: 'Detector PIR con fotos HDR bajo demanda', match: ['motioncam-hdr-phod'] },
  { titulo: 'Detector PIR con verificación fotográfica HDR', match: ['motioncam-hdr'] },
  { titulo: 'Detector exterior con fotos bajo demanda', match: ['motioncamoutdoor', 'phod'] },
  { titulo: 'Detector exterior con verificación fotográfica', match: ['motioncamoutdoor'] },
  { titulo: 'Detector PIR con verificación fotográfica', match: ['motioncam'] },
  { titulo: 'Detector PIR con microondas antimasking', match: ['motionprotectplus'] },
  { titulo: 'Detector PIR interior antimascotas', match: ['motionprotect'] },
  { titulo: 'Detector PIR exterior antimascotas', match: ['outdoorprotect'] },
  { titulo: 'Contacto magnético con vibración e inclinación', match: ['doorprotectplus'] },
  { titulo: 'Contacto magnético para puerta o ventana', match: ['doorprotect'] },
  { titulo: 'Detector acústico de rotura de cristal', match: ['glassprotect'] },
  { titulo: 'Detector cortina con verificación fotográfica', match: ['curtaincam'] },
  { titulo: 'Doble detector cortina para exterior', match: ['dualcurtain'] },
  { titulo: 'Detector cortina para exterior', match: ['curtainoutdoor'] },
  { titulo: 'Detector cortina para interior', match: ['curtainprotect'] },
  { titulo: 'Detector PIR y rotura de cristal', match: ['combiprotect'] },

  // Teclados, sirenas y mandos
  { titulo: 'Teclado táctil con pantalla, RFID y Bluetooth', match: ['keypadtouchscreen'] },
  { titulo: 'Teclado exterior IP66 con RFID y Bluetooth', match: ['keypadoutdoor'] },
  { titulo: 'Teclado con sirena integrada y lector RFID', match: ['keypadcombi'] },
  { titulo: 'Teclado con lector RFID para Pass y Tag', match: ['keypadplus'] },
  { titulo: 'Teclado inalámbrico de armado y desarmado', match: ['keypad'] },
  { titulo: 'Sirena interior inalámbrica', match: ['homesiren'] },
  { titulo: 'Sirena exterior personalizable', match: ['streetsirencustom'] },
  { titulo: 'Sirena exterior con señalización LED', match: ['streetsiren'] },
  { titulo: 'Mando para armado, desarmado y pánico', match: ['spacecontrol'] },
  { titulo: 'Pulsador doble contra activación accidental', match: ['doublebutton'] },
  { titulo: 'Pulsador inalámbrico programable', match: ['button'] },
  { titulo: 'Llavero RFID para control de acceso', match: ['tag'] },
  { titulo: 'Tarjeta RFID para control de acceso', match: ['pass'] },

  // Incendio, agua y calidad ambiental
  { titulo: 'Detector calor, humo y CO con sirena', match: ['fireprotect2-hsc'] },
  { titulo: 'Detector de calor y humo con sirena', match: ['fireprotect2-hs'] },
  { titulo: 'Detector de calor, humo y CO', match: ['fireprotect2-hc'] },
  { titulo: 'Detector de calor y humo', match: ['fireprotect2-h'] },
  { titulo: 'Detector de monóxido de carbono', match: ['fireprotect2-c'] },
  { titulo: 'Detector de humo, calor y CO', match: ['fireprotectplus'] },
  { titulo: 'Detector de humo y temperatura', match: ['fireprotect'] },
  { titulo: 'Pulsador manual de alarma de incendio', match: ['manualcallpoint'] },
  { titulo: 'Detector inalámbrico de inundación', match: ['leaksprotect'] },
  { titulo: 'Válvula motorizada de corte de agua', match: ['waterstop'] },
  { titulo: 'Medidor básico de calidad del aire', match: ['lifequality-lite'] },
  { titulo: 'Medidor de CO₂, temperatura y humedad', match: ['lifequality'] },

  // Videovigilancia
  { titulo: 'Cámara IP bullet con IA y visión nocturna', match: ['bulletcam'] },
  { titulo: 'Cámara IP domo mini con IA', match: ['domecam-mini'] },
  { titulo: 'Cámara IP domo con IA y visión nocturna', match: ['domecam'] },
  { titulo: 'Cámara IP turret con IA y visión nocturna', match: ['turretcam'] },
  { titulo: 'Cámara IP interior con audio y detección IA', match: ['indoorcam'] },
  { titulo: 'Videoportero Wi-Fi con cámara y detección IA', match: ['doorbell'] },
  { titulo: 'Kit de grabación NVR para videovigilancia', match: ['nvrkit'] },
  { titulo: 'Grabador NVR para cámaras IP Ajax', match: ['nvr'] },

  // Domótica
  { titulo: 'Interruptor táctil doble de dos vías', match: ['lightcore-2g2w'] },
  { titulo: 'Interruptor táctil doble', match: ['lightcore-2g'] },
  { titulo: 'Interruptor táctil de dos vías', match: ['lightcore-2w'] },
  { titulo: 'Interruptor táctil de una tecla', match: ['lightcore-1g'] },
  { titulo: 'Interruptor táctil de cruzamiento', match: ['lightcore-cross'] },
  { titulo: 'Regulador táctil de iluminación', match: ['lightcore-dimmer'] },
  { titulo: 'Enchufe inteligente con medición de consumo', match: ['socket'] },
  { titulo: 'Mecanismo de enchufe inteligente', match: ['outletcore-smart'] },
  { titulo: 'Mecanismo de enchufe con conexión LAN', match: ['outletcore-lan'] },
  { titulo: 'Mecanismo de enchufe básico', match: ['outletcore-basic'] },
  { titulo: 'Relé inalámbrico de contacto seco', match: ['relay'] },
  { titulo: 'Relé inalámbrico para cargas de 230 V', match: ['wallswitch'] },

  // Integración
  { titulo: 'Módulo para integrar un detector cableado', match: ['transmitter'] },
  { titulo: 'Módulo para integrar detectores cableados', match: ['multitransmitter'] },
  { titulo: 'Módulo de integración por UART', match: ['uartbridge'] },
  { titulo: 'Módulo receptor para sistemas de terceros', match: ['ocbridge'] },
  { titulo: 'Módulo para transmitir alarmas por radio VHF', match: ['vhfbridge'] },

  // Accesorios: las reglas dobles ganan a la familia principal
  { titulo: 'Carcasa de exposición para MotionCam', match: ['motioncam', 'dummy'] },
  { titulo: 'Carcasa de exposición para MotionProtect', match: ['motionprotect', 'dummy'] },
  { titulo: 'Carcasa de exposición para DoorProtect', match: ['doorprotect', 'dummy'] },
  { titulo: 'Carcasa de exposición para FireProtect', match: ['fireprotect', 'dummy'] },
  { titulo: 'Carcasa de exposición sin electrónica', match: ['dummy'] },
  { titulo: 'Soporte orientable para MotionProtect', match: ['bracketmp'] },
  { titulo: 'Soporte orientable para MotionCam', match: ['bracketm'] },
  { titulo: 'Soporte para DoorProtect', match: ['bracketdp'] },
  { titulo: 'Soporte para FireProtect', match: ['bracketfp'] },
  { titulo: 'Soporte para KeyPad', match: ['bracketkp'] },
  { titulo: 'Soporte para HomeSiren', match: ['brackeths'] },
  { titulo: 'Soporte para central Hub', match: ['brackethub'] },
  { titulo: 'Soporte de montaje para dispositivo Ajax', match: ['bracket'] },
  { titulo: 'Visera protectora para MotionCam Outdoor', match: ['hood-motioncamoutdoor'] },
  { titulo: 'Visera protectora para detector exterior', match: ['hood'] },
  { titulo: 'Caja estanca de conexiones para cámaras', match: ['junctionbox'] },
  { titulo: 'Caja de superficie para mecanismos', match: ['surfacebox'] },
  { titulo: 'Marco decorativo para mecanismos', match: ['frame'] },
  { titulo: 'Tapa embellecedora para mecanismo', match: ['coverplate'] },
  { titulo: 'Tapa central para LightSwitch', match: ['centercover'] },
  { titulo: 'Tapa lateral para LightSwitch', match: ['sidecover'] },
  { titulo: 'Tapa simple para LightSwitch', match: ['solocover'] },
  { titulo: 'Botón central para LightSwitch', match: ['centerbutton'] },
  { titulo: 'Botón lateral para LightSwitch', match: ['sidebutton'] },
  { titulo: 'Botón simple para LightSwitch', match: ['solobutton'] },
  { titulo: 'Lente de recambio para detector', match: ['lens'] },
  { titulo: 'Imán de recambio para contacto magnético', match: ['magnet'] },
  { titulo: 'Contacto reed de recambio', match: ['reedswitch'] },
  { titulo: 'Fuente de alimentación para dispositivo Ajax', match: ['psu'] },
  { titulo: 'Batería de respaldo para dispositivo Ajax', match: ['battery'] },
  { titulo: 'Placa de alimentación a 230 V', match: ['ac220'] },
  { titulo: 'Placa de alimentación en corriente continua', match: ['dc12'] },

  // Almacenamiento
  { titulo: 'Disco duro para grabación de vídeo', match: ['hd'] },
  { titulo: 'Tarjeta microSD para cámaras Ajax', match: ['hs-tf'] }
];
