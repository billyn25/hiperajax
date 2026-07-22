/* ============================================================
   BUSCAR_REGLAS.JS — reglas manuales fáciles de ampliar

   Solo edita este archivo para enseñar nuevas búsquedas.

   buscar: palabras o frases que puede escribir una persona.
   priorizar: fragmentos que deben contener las referencias/nombres preferidos.
   bajar: fragmentos que deben perder prioridad.
   relacionados: otros términos útiles que el motor añade a la búsqueda.

   Ejemplo:
   {
     buscar: ['sirena exterior', 'sirena calle'],
     priorizar: ['STREETSIREN'],
     relacionados: ['sirena', 'exterior']
   }
   ============================================================ */
window.HXA_SEARCH_RULES = [
  // Almacenamiento / CCTV
  { buscar:['disco duro','disco','hdd','hard disk'], priorizar:['HD1TB','HD2TB','HD4TB','HD6TB','HD8TB','HDD'], bajar:['SD','TF'], relacionados:['nvr','grabacion'] },
  { buscar:['micro sd','microsd','tarjeta sd','memoria sd','sd camara','tarjeta memoria'], priorizar:['HS-TF','MICROSD','MICRO-SD','SD'], bajar:['HDD','HD1TB','HD2TB','HD4TB'], relacionados:['camara autonoma','grabacion local'] },
  { buscar:['memoria'], priorizar:['HS-TF','MICROSD','MICRO-SD','SD','HDD'], relacionados:['almacenamiento'] },
  { buscar:['grabador','videograbador','nvr'], priorizar:['NVR'], relacionados:['hdd','hdmi'] },
  { buscar:['nvr 8','grabador 8','8 camaras'], priorizar:['NVR208','NVR108','HAC'], bajar:['NVR216','NVR232'], relacionados:['hdd','hdmi'] },
  { buscar:['nvr 16','grabador 16','16 camaras'], priorizar:['NVR216','NVR116','HAC'], bajar:['NVR108'], relacionados:['hdd','hdmi'] },

  // Cámaras
  { buscar:['domo','camara domo','camara techo','camara redonda'], priorizar:['DOMECAM','TURRETCAM'], bajar:['BULLETCAM'], relacionados:['camara','techo'] },
  { buscar:['turret','torreta','camara torreta'], priorizar:['TURRETCAM'], relacionados:['domo','camara'] },
  { buscar:['bullet','bala','camara bala'], priorizar:['BULLETCAM'], bajar:['DOMECAM','TURRETCAM'], relacionados:['camara','exterior'] },
  { buscar:['camara interior'], priorizar:['INDOORCAM','DOMECAM','TURRETCAM'], relacionados:['camara'] },
  { buscar:['camara exterior'], priorizar:['TURRETCAM','BULLETCAM','DOMECAM'], bajar:['INDOORCAM'], relacionados:['camara','exterior'] },
  { buscar:['camara 5 mp','camara 5mp','5 megapixel','5 megapixeles'], priorizar:['CAM-5','-5-'], bajar:['CAM-8'], relacionados:['camara'] },
  { buscar:['camara 8 mp','camara 8mp','8 megapixel','8 megapixeles'], priorizar:['CAM-8','-8-'], bajar:['CAM-5'], relacionados:['camara'] },
  { buscar:['soporte camara','caja conexiones','ocultar conexiones','junction'], priorizar:['JUNCTIONBOX'], relacionados:['soporte','camara'] },
  { buscar:['poe','switch poe','alimentar camaras poe'], priorizar:['POE','SWITCH'], relacionados:['alimentacion','camara'] },
  { buscar:['fuente camara','12v 2a','fuente 12v'], priorizar:['DC12V','12V','PSU'], relacionados:['alimentacion','camara'] },

  // Hubs y repetidores
  { buscar:['hub','central','central alarma'], priorizar:['AJ-HUB2-W','AJ-HUB2-4G-W','AJ-HUB2PLUS-W','AJ-HUB-W'], bajar:['KIT','DUMMY','BATTERY','BRACKET','MINIHUB'] },
  { buscar:['hub basico','hub normal','central basica'], priorizar:['AJ-HUB-W'], bajar:['HUB2PLUS','HUB2-4G','KIT'], relacionados:['sin motioncam'] },
  { buscar:['hub con fotos','hub foto','central con foto','hub motioncam'], priorizar:['AJ-HUB2-W','AJ-HUB2-4G-W','AJ-HUB2PLUS-W'], bajar:['AJ-HUB-W'], relacionados:['motioncam','phod'] },
  { buscar:['hub wifi','central wifi'], priorizar:['HUB2PLUS','HUBPLUS'], bajar:['AJ-HUB-W'], relacionados:['wifi','ethernet'] },
  { buscar:['hub 4g','central 4g','hub lte'], priorizar:['HUB2-4G','4G'], relacionados:['lte'] },
  { buscar:['repetidor','amplificador señal'], priorizar:['REX2','REX'], relacionados:['señal'] },
  { buscar:['repetidor motioncam','repetidor con fotos','rex motioncam'], priorizar:['REX2'], bajar:['AJ-REX-W','AJ-REX-B'], relacionados:['motioncam'] },

  // Intrusión
  { buscar:['detector movimiento','sensor movimiento','volumetrico'], priorizar:['MOTIONPROTECT','MOTIONCAM'], bajar:['DUMMY','LENS'] },
  { buscar:['detector con foto','sensor con foto','fotosensor','foto sensor','verificacion fotografica','motcam'], priorizar:['MOTIONCAM'], bajar:['MOTIONPROTECT','DUMMY','LENS','HOOD'] },
  { buscar:['detector exterior con foto','sensor exterior con camara'], priorizar:['MOTIONCAMOUTDOOR'], relacionados:['outdoor','phod'] },
  { buscar:['detector exterior sin foto'], priorizar:['OUTDOORPROTECT','DUALCURTAIN','CURTAINOUTDOOR'], bajar:['MOTIONCAM'], relacionados:['exterior'] },
  { buscar:['puerta','ventana','contacto magnetico','detector apertura'], priorizar:['DOORPROTECT'], bajar:['DUMMY','MAGNET'], relacionados:['apertura'] },
  { buscar:['cristal','rotura cristal','sensor cristal'], priorizar:['GLASSPROTECT','COMBIPROTECT'], relacionados:['cristal'] },
  { buscar:['cristal y movimiento','movimiento y cristal'], priorizar:['COMBIPROTECT'], bajar:['GLASSPROTECT'], relacionados:['movimiento','cristal'] },
  { buscar:['cortina','detector cortina','pasillo','ventanal'], priorizar:['CURTAINPROTECT','CURTAINOUTDOOR','DUALCURTAIN','CURTAINCAM'], bajar:['DUMMY'] },
  { buscar:['sirena interior','sirena casa'], priorizar:['HOMESIREN'], relacionados:['sirena'] },
  { buscar:['sirena exterior','sirena calle'], priorizar:['STREETSIREN'], relacionados:['sirena','exterior'] },
  { buscar:['mando','llavero','armar alarma'], priorizar:['SPACECONTROL','KEYPAD'], relacionados:['armado'] },
  { buscar:['teclado','panel armar'], priorizar:['KEYPADTOUCHSCREEN','KEYPADPLUS','KEYPAD'], relacionados:['armado'] },
  { buscar:['boton panico','pulsador panico'], priorizar:['BUTTON','DOUBLEBUTTON'], relacionados:['panico'] },
  { buscar:['detector agua','fuga agua','inundacion'], priorizar:['LEAKSPROTECT'], relacionados:['agua'] },
  { buscar:['humo','fuego','incendio','detector fuego'], priorizar:['FIREPROTECT'], relacionados:['humo','incendio'] },
  { buscar:['integrar sensor','sensor tercero','transmisor'], priorizar:['TRANSMITTER','MULTITRANSMITTER','DOORPROTECT'], relacionados:['integracion'] },

  // Domótica
  { buscar:['rele','rele inteligente'], priorizar:['RELAY','WALLSWITCH'], relacionados:['automatizacion'] },
  { buscar:['enchufe','enchufe inteligente'], priorizar:['SOCKET','OUTLETCORE'], relacionados:['domotica'] },
  { buscar:['interruptor','interruptor luz','luz inteligente'], priorizar:['LIGHTCORE','LIGHTSWITCH'], relacionados:['domotica'] },
  { buscar:['domotica','automatizacion'], priorizar:['LIGHTCORE','OUTLETCORE','SOCKET','RELAY','WALLSWITCH'], relacionados:['inteligente'] }
];
