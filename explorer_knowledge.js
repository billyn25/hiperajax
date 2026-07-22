/* Hiper Ajax - Motor de conocimiento del Explorer (laboratorio aislado)
   - El CSV sigue siendo la fuente de productos.
   - Este archivo solo mejora ranking, variantes y comprensión de búsquedas.
   - Los productos nuevos siguen apareciendo aunque no exista una regla específica. */
(function(global){
  'use strict';

  const normalize = (value='') => String(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const compact = (value='') => normalize(value).replace(/\s+/g,'');
  const tokens = (value='') => normalize(value).split(/\s+/).filter(Boolean);

  const KNOWLEDGE = {
    version: '3.0.0',
    colorVariants: {
      blackTokens: ['negro','black'],
      whiteTokens: ['blanco','white'],
      blackPenalty: 9,
      whiteDefaultBoost: 4
    },
    genericAliases: {
      central:['hub','alarma'],
      repetidor:['rex','repetidor señal','amplificador señal'],
      fotosensor:['motioncam','foto verificacion','detector con foto'],
      bajodemanda:['phod','photo on demand','foto bajo demanda'],
      cristal:['glassprotect','combiprotect','rotura cristal'],
      cortina:['curtain','dualcurtain','doublecurtain','pasillo','ventanal'],
      sirena:['homesiren','streetsiren'],
      inundacion:['leaksprotect','fuga agua','detector agua'],
      fuego:['fireprotect','humo','incendio','co'],
      grabador:['nvr','videograbador'],
      disco:['hdd','disco duro'],
      tarjeta:['microsd','micro sd','sd'],
      camara:['bulletcam','turretcam','domecam','indoorcam'],
      soporte:['junctionbox','caja conexiones'],
      rele:['relay','wallswitch'],
      enchufe:['socket','outletcore'],
      teclado:['keypad','keypadplus','keypadtouch'],
      mando:['spacecontrol','llavero'],
      panico:['button','doublebutton'],
      integracion:['transmitter','sensor terceros','entrada cableada'],
      poe:['switch poe','alimentacion poe'],
      wifi:['wifi','wi fi'],
      lte:['lte','4g'],
      cableado:['hybrid','hibrido']
    },
    intents: [
      { id:'hub_general', aliases:['hub','central alarma'], prefer:['AJ-HUB2-W','AJ-HUB2-DC6V-W','AJ-HUB2'], boost:45 },
      { id:'hub_basic', aliases:['hub basico','hub normal','central basica','alarma basica'], prefer:['AJ-HUB-W'], avoid:['MOTIONCAM','PHOD','LIGHTCORE','OUTLETCORE'], boost:54 },
      { id:'hub_photo', aliases:['hub con fotos','hub fotos','central con fotos','hub para motioncam','hub compatible phod'], prefer:['AJ-HUB2','AJ-HUB2-4G','HUBPLUS','HUB-HYBRID'], avoid:['AJ-HUB-W'], boost:62 },
      { id:'hub_4g', aliases:['hub 4g','central 4g','lte','sim 4g'], prefer:['HUB2-4G','4G'], boost:70 },
      { id:'hub_wifi', aliases:['hub wifi','central wifi','wifi'], prefer:['HUB2PLUS','HUBPLUS','HUB-PLUS'], boost:72 },
      { id:'hub_hybrid', aliases:['hub cableado','hibrido','hybrid','cableado y via radio'], prefer:['HUBHYBRID','HUB-HYBRID'], boost:72 },
      { id:'repeater_photo', aliases:['repetidor motioncam','repetidor fotos','rex motioncam','rex con fotos'], prefer:['REX2'], avoid:['AJ-REX-W','AJ-REX-B'], boost:68 },
      { id:'glass_motion', aliases:['cristal y movimiento','movimiento cristal','combi','doble tecnologia cristal'], prefer:['COMBIPROTECT'], boost:64 },
      { id:'glass_only', aliases:['solo cristal','rotura cristal','detector cristal'], prefer:['GLASSPROTECT'], boost:58 },
      { id:'curtain', aliases:['cortina','pasillo estrecho','ventanal','proteccion cortina'], prefer:['CURTAINPROTECT','CURTAINOUTDOOR','DUALCURTAIN'], boost:58 },
      { id:'siren_outdoor', aliases:['sirena exterior','sirena calle','sirena fuera'], prefer:['STREETSIREN'], boost:64 },
      { id:'siren_indoor', aliases:['sirena interior','sirena casa','sirena dentro'], prefer:['HOMESIREN'], boost:64 },
      { id:'panic', aliases:['boton panico','panico','pulsador panico'], prefer:['BUTTON','DOUBLEBUTTON'], boost:52 },
      { id:'third_party', aliases:['sensor tercero','integrar sensor','transmisor terceros','entrada cableada'], prefer:['TRANSMITTER','DOORPROTECT'], boost:52 },
      { id:'flood', aliases:['inundacion','fuga agua','agua','detector agua'], prefer:['LEAKSPROTECT'], boost:70 },
      { id:'fire', aliases:['humo','fuego','incendio','monoxido de carbono'], prefer:['FIREPROTECT'], boost:62 },
      { id:'nvr_8', aliases:['nvr 8','grabador 8','8 camaras','grabador pequeno'], prefer:['NVR','8'], boost:60 },
      { id:'nvr_16', aliases:['nvr 16','grabador 16','16 camaras'], prefer:['NVR','16'], boost:64 },
      { id:'camera_bullet_5', aliases:['bullet 5','camara bala 5','camara exterior 5'], prefer:['BULLETCAM-5'], boost:64 },
      { id:'camera_turret_5', aliases:['turret 5','camara torreta 5','camara exterior 5'], prefer:['TURRETCAM-5'], boost:64 },
      { id:'junction', aliases:['caja camara','soporte camara','ocultar conexiones','junction'], prefer:['JUNCTIONBOX'], boost:64 },
      { id:'camera_power', aliases:['alimentar camara','fuente camara','12v 2a','switch poe','poe'], prefer:['DC12V','POE','SWITCH'], boost:52 },
      { id:'camera_sd', aliases:['camara sin nvr','camara autonoma','micro sd','tarjeta sd','backup camara'], prefer:['HS-TF','MICROSD','MICRO-SD'], boost:70 },
      { id:'nvr_hdd', aliases:['disco nvr','hdd nvr','grabacion nvr','disco duro'], prefer:['HDD','HD1TB','HD2TB','HD4TB','HD6TB','HD8TB'], boost:74 }
    ],
    familyRules: [
      { test:/AJ-HUB2-4G/i, priority:99, tags:['hub','4g','lte','foto','motioncam','phod','domotica','demanda creciente'] },
      { test:/AJ-HUB2(?!KIT)/i, priority:100, tags:['hub','2g','foto','motioncam','phod','domotica','mas vendido'] },
      { test:/HUB.*PLUS|HUBPLUS/i, priority:97, tags:['hub','wifi','ethernet','lte','foto','motioncam','phod','completo'] },
      { test:/AJ-HUB-(?:W|B)(?:$|-)/i, priority:78, tags:['hub','basico','sin 4g','sin motioncam','sin phod','sin lightcore','sin outletcore'] },
      { test:/REX2/i, priority:91, tags:['repetidor','motioncam','foto','moderno'] },
      { test:/AJ-REX-(?:W|B)(?:$|-)|\bREX-(?:W|B)\b/i, priority:72, tags:['repetidor','sin motioncam','sin ocbridge','sin uartbridge'] },
      { test:/DOORPROTECT-(?:W|B)(?:$|-)/i, priority:89, tags:['puerta','ventana','basico','entrada rele'] },
      { test:/MOTIONPROTECT-(?:W|B)(?:$|-)/i, priority:89, tags:['movimiento','basico'] },
      { test:/DOORPROTECTPLUS/i, priority:85, tags:['puerta','ventana','plus'] },
      { test:/MOTIONPROTECTPLUS/i, priority:85, tags:['movimiento','plus'] },
      { test:/COMBIPROTECT/i, priority:83, tags:['movimiento','cristal'] },
      { test:/GLASSPROTECT/i, priority:81, tags:['cristal','rotura'] },
      { test:/MOTIONCAM/i, priority:87, tags:['movimiento','foto','fotosensor','phod'] },
      { test:/CURTAIN/i, priority:71, tags:['cortina','perimetral','menos usado'] },
      { test:/SPACE.?CONTROL|KEYPAD/i, priority:83, tags:['armado','desarmado','control'] },
      { test:/HOMESIREN/i, priority:83, tags:['sirena','interior'] },
      { test:/STREETSIREN/i, priority:85, tags:['sirena','exterior'] },
      { test:/DOUBLEBUTTON/i, priority:63, tags:['panico','menos vendido'] },
      { test:/AJ-BUTTON/i, priority:77, tags:['panico','escenarios'] },
      { test:/RELAY|WALLSWITCH/i, priority:75, tags:['rele','automatizacion','inteligente'] },
      { test:/LEAKSPROTECT/i, priority:77, tags:['inundacion','agua'] },
      { test:/FIREPROTECT/i, priority:79, tags:['fuego','humo','incendio'] },
      { test:/SOCKET/i, priority:75, tags:['enchufe','domotica'] },
      { test:/TRANSMITTER/i, priority:73, tags:['integracion','sensor tercero'] },
      { test:/NVR.*HAC.*8|NVR.*8.*HAC/i, priority:93, tags:['nvr','8 canales','hdmi','hdd obligatorio'] },
      { test:/NVR.*HAC.*16|NVR.*16.*HAC/i, priority:91, tags:['nvr','16 canales','hdmi','hdd obligatorio'] },
      { test:/BULLETCAM-5/i, priority:89, tags:['camara','bullet','5mp','habitual'] },
      { test:/TURRETCAM-5/i, priority:91, tags:['camara','turret','5mp','habitual'] },
      { test:/(?:BULLET|TURRET)CAM-8/i, priority:76, tags:['camara','8mp','menos vendido'] },
      { test:/JUNCTIONBOX/i, priority:73, tags:['soporte','caja','ocultar conexiones','opcional'] }
    ]
  };

  function expandQuery(query){
    const original = normalize(query);
    const stop=new Set(['y','o','de','del','la','el','los','las','con','sin','para','por','un','una']);
    const expanded = new Set(tokens(original).filter(t=>!stop.has(t)));
    Object.entries(KNOWLEDGE.genericAliases).forEach(([key, values]) => {
      const all = [key, ...values].map(normalize);
      if(all.some(a => original.includes(a))){ all.forEach(a => tokens(a).forEach(t => expanded.add(t))); }
    });
    return { original, tokens:[...expanded] };
  }

  function editDistance(a,b){
    if(a===b) return 0; if(!a.length) return b.length; if(!b.length) return a.length;
    const prev=Array.from({length:b.length+1},(_,i)=>i), cur=new Array(b.length+1);
    for(let i=1;i<=a.length;i++){
      cur[0]=i;
      for(let j=1;j<=b.length;j++) cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
      for(let j=0;j<=b.length;j++) prev[j]=cur[j];
    }
    return prev[b.length];
  }

  function fuzzyTokenScore(token, hayTokens){
    if(token.length < 4) return 0;
    let best=0;
    for(const h of hayTokens){
      if(h.startsWith(token) || token.startsWith(h)) best=Math.max(best,12);
      else {
        const d=editDistance(token,h);
        if(d===1) best=Math.max(best,10);
        else if(d===2 && token.length>=6) best=Math.max(best,5);
      }
    }
    return best;
  }

  function detectColor(name){
    const n=String(name).toUpperCase();
    if(/-B(?:-|$)/.test(n)) return 'black';
    if(/-W(?:-|$)/.test(n)) return 'white';
    return 'other';
  }

  function variantBase(name){
    return String(name).toUpperCase()
      .replace(/-B(?=-|$)/g,'-COLOR')
      .replace(/-W(?=-|$)/g,'-COLOR')
      .replace(/\s+/g,'');
  }

  function getFamilyRule(name){ return KNOWLEDGE.familyRules.find(r => r.test.test(String(name))) || null; }

  function matchesPattern(name, pattern){ return compact(name).includes(compact(pattern)); }

  function analyzeQuery(query){
    const q=normalize(query);
    const has=(...words)=>words.some(w=>q.includes(normalize(w)));
    return {
      q,
      asksBlack:has('negro','black'),
      asksWhite:has('blanco','white'),
      asksPhod:has('phod','bajo demanda','photo on demand','foto bajo demanda'),
      asksOutdoor:has('outdoor','exterior','calle','fuera'),
      asksIndoor:has('interior','dentro','casa'),
      asksHighMount:has('highmount','high mount','montaje alto','altura'),
      asksDome:has('domo','dome','domecam'),
      asksTurret:has('turret','torreta','turretcam'),
      asksBullet:has('bullet','bala','bulletcam'),
      asksMotionCam:has('motioncam','fotosensor','foto sensor','detector con foto','verificacion fotografica'),
      asksMotionOnly:has('motionprotect','movimiento sin foto','detector movimiento'),
      asksNvr:has('nvr','grabador','videograbador'),
      asksNoNvr:has('sin nvr','sin grabador','autonoma','autonomas'),
      asksSd:has('sd','micro sd','microsd','tarjeta'),
      asksHdd:has('hdd','disco duro','disco nvr'),
      asks5mp:has('5mp','5 mp','5 megapixel','5 megapixeles'),
      asks8mp:has('8mp','8 mp','8 megapixel','8 megapixeles')
    };
  }

  function productFeatures(product){
    const name=String(product.name||product.ref||'').toUpperCase();
    const text=normalize([product.name,product.description,product.brand].join(' '));
    return {
      name,text,
      isBlack:/-B(?:-|$)/.test(name),
      isWhite:/-W(?:-|$)/.test(name),
      isDummy:/DUMMY|REPAIR|LENS|HOOD|BRACKET|BRANDPLATE/.test(name),
      isMotionCam:/MOTIONCAM/.test(name) && !/DUMMY|LENS|HOOD/.test(name),
      isMotionProtect:/MOTIONPROTECT/.test(name),
      isPhod:/PHOD/.test(name),
      isOutdoor:/OUTDOOR/.test(name),
      isHighMount:/HIGHMOUNT/.test(name),
      isDome:/DOMECAM/.test(name),
      isTurret:/TURRETCAM/.test(name),
      isBullet:/BULLETCAM/.test(name),
      isNvr:/\bNVR/.test(name),
      isSd:/HS[-_ ]?TF|MICRO.?SD|\bSD\b/.test(name),
      isHdd:/\bHD\d+TB|\bHDD/.test(name),
      is5mp:/CAM-5(?:-|$)|\b5MP\b/.test(name),
      is8mp:/CAM-8(?:-|$)|\b8MP\b/.test(name)
    };
  }

  function applyFacetRanking(product, query, score, reasons){
    const a=analyzeQuery(query), f=productFeatures(product);
    let delta=0;

    // Familia exacta de cámara: evita mezclar Dome/Turret/Bullet.
    if(a.asksDome){ if(f.isDome){delta+=170;reasons.push('familia Dome solicitada');} else if(f.isTurret){delta+=125;reasons.push('Turret relacionada con domo');} else if(f.isBullet){delta-=180;} }
    if(a.asksTurret){ if(f.isTurret){delta+=175;reasons.push('familia Turret solicitada');} else if(f.isDome){delta+=55;reasons.push('Dome relacionada');} else if(f.isBullet){delta-=180;} }
    if(a.asksBullet){ if(f.isBullet){delta+=150;reasons.push('familia Bullet solicitada');} else if(f.isDome||f.isTurret){delta-=180;} }

    // Fotosensor significa MotionCam, no cualquier detector de movimiento.
    if(a.asksMotionCam){
      if(f.isMotionCam){delta+=165;reasons.push('detector con foto solicitado');}
      if(f.isMotionProtect){delta-=150;}
      if(!f.isMotionCam && /MOTION/.test(f.name)){delta-=80;}

      // Orden natural cuando solo se pide MotionCam:
      // interior estándar W, interior estándar B, interior PhOD W/B,
      // outdoor estándar, outdoor PhOD, high mount.
      if(f.isMotionCam){
        if(!a.asksOutdoor && !a.asksPhod && !a.asksHighMount){
          if(!f.isOutdoor && !f.isPhod && f.isWhite) delta+=90;
          else if(!f.isOutdoor && !f.isPhod && f.isBlack) delta+=78;
          else if(!f.isOutdoor && f.isPhod && f.isWhite) delta+=62;
          else if(!f.isOutdoor && f.isPhod && f.isBlack) delta+=52;
          else if(f.isOutdoor && !f.isPhod) delta+=48;
          else if(f.isOutdoor && f.isPhod && !f.isHighMount) delta+=30;
          else if(f.isHighMount) delta+=10;
        }
        if(a.asksPhod){ if(f.isPhod) delta+=105; else delta-=45; }
        if(a.asksOutdoor){ if(f.isOutdoor) delta+=110; else delta-=55; }
        if(a.asksIndoor){ if(!f.isOutdoor) delta+=80; else delta-=45; }
        if(a.asksHighMount){ if(f.isHighMount) delta+=125; else delta-=35; }
      }
    }

    // En búsquedas genéricas de cámara se prioriza 5 MP por uso comercial.
    if((a.asksDome||a.asksTurret||a.asksBullet) && !a.asks5mp && !a.asks8mp){
      if(f.is5mp) delta+=42;
      if(f.is8mp) delta-=8;
    }

    // Resolución explícita.
    if(a.asks5mp){ if(f.is5mp) delta+=85; if(f.is8mp) delta-=45; }
    if(a.asks8mp){ if(f.is8mp) delta+=95; if(f.is5mp) delta-=35; }

    // Grabación: con NVR/HDD frente a autónomas/MicroSD.
    if(a.asksNoNvr){ if(f.isSd) delta+=125; if(f.isNvr||f.isHdd) delta-=90; }
    if(a.asksNvr){ if(f.isNvr) delta+=90; if(f.isHdd) delta+=35; }
    if(a.asksSd){ if(f.isSd) delta+=120; }
    if(a.asksHdd){ if(f.isHdd) delta+=120; }

    // Color explícito o preferencia blanca por defecto.
    if(a.asksBlack){ if(f.isBlack) delta+=65; if(f.isWhite) delta-=35; }
    else if(a.asksWhite){ if(f.isWhite) delta+=65; if(f.isBlack) delta-=35; }
    else { if(f.isWhite) delta+=12; if(f.isBlack) delta-=4; }

    if(f.isDummy){delta-=150;}
    return score+delta;
  }

  function scoreProduct(product, query){
    const name = product.name || product.ref || '';
    const description = product.description || product.desc || '';
    const brand = product.brand || '';
    const hay = normalize([name,description,brand].join(' '));
    const hayTokens=tokens(hay);
    const queryInfo=expandQuery(query);
    const q=queryInfo.original;
    if(!q) return {score:0,reasons:[]};

    let score=0; const reasons=[];
    if(normalize(name)===q){score+=140;reasons.push('coincidencia exacta');}
    else if(normalize(name).includes(q)){score+=80;reasons.push('nombre contiene la búsqueda');}

    let directMatches=0;
    for(const t of queryInfo.tokens){
      if(hayTokens.includes(t)){score+=24;directMatches++;}
      else if(hay.includes(t)){score+=14;directMatches++;}
      else score+=fuzzyTokenScore(t,hayTokens);
    }
    if(directMatches) reasons.push(`${directMatches} término(s) coincidente(s)`);

    const rule=getFamilyRule(name);
    if(rule){
      score+=rule.priority*.32;
      const tagText=normalize(rule.tags.join(' '));
      let tagHits=0;
      for(const t of queryInfo.tokens){ if(tagText.includes(t)){score+=20;tagHits++;} }
      if(tagHits) reasons.push('coincide con conocimiento técnico');
      if(rule.priority>=90) reasons.push('alta prioridad comercial');
    }

    for(const intent of KNOWLEDGE.intents){
      const active=intent.aliases.some(a => { const na=normalize(a); return q===na || q.includes(na); });
      if(!active) continue;
      const preferred=(intent.prefer||[]).filter(p => matchesPattern(name,p)).length;
      const avoided=(intent.avoid||[]).filter(p => matchesPattern(name,p)).length;
      if(preferred){score+=intent.boost + 18;reasons.push(`intención: ${intent.id}`);}
      if(avoided){score-=intent.boost;reasons.push('penalizado por incompatibilidad/contexto');}
    }

    const color=detectColor(name);
    const asksBlack=KNOWLEDGE.colorVariants.blackTokens.some(t=>q.includes(t));
    const asksWhite=KNOWLEDGE.colorVariants.whiteTokens.some(t=>q.includes(t));
    if(color==='black' && !asksBlack){score-=KNOWLEDGE.colorVariants.blackPenalty;reasons.push('variante negra con menor prioridad');}
    if(color==='black' && asksBlack){score+=28;reasons.push('color negro solicitado');}
    if(color==='white' && !asksBlack){score+=KNOWLEDGE.colorVariants.whiteDefaultBoost;}
    if(color==='white' && asksWhite){score+=28;reasons.push('color blanco solicitado');}

    if(/DUMMY|REPAIR|BRACKET|BATTERYKIT|BRANDPLATE/i.test(name) && !/(dummy|kit|repuesto|repair|bracket|soporte|bateria|brandplate)/.test(q)){
      score-=42; reasons.push('accesorio/repuesto no solicitado');
    }
    score=applyFacetRanking(product,query,score,reasons);
    return {score,reasons:[...new Set(reasons)]};
  }

  function rank(products, query, limit=60){
    let ranked=products.map(p=>{
      const r=scoreProduct(p,query);
      return {...p,_score:r.score,_reasons:r.reasons,_variantBase:variantBase(p.name||p.ref||''),_color:detectColor(p.name||p.ref||'')};
    }).filter(p=>p._score>0)
      .sort((a,b)=>b._score-a._score || String(a.name).localeCompare(String(b.name)));

    // Si la intención identifica una familia inequívoca, evita ruido de otras familias.
    const a=analyzeQuery(query);
    if(a.asksMotionCam){
      const focused=ranked.filter(p=>productFeatures(p).isMotionCam);
      if(focused.length>=3) ranked=focused;
    } else if(a.asksDome){
      const focused=ranked.filter(p=>{const f=productFeatures(p); return f.isDome || f.isTurret;});
      if(focused.length) ranked=focused;
    } else if(a.asksTurret){
      const focused=ranked.filter(p=>{const f=productFeatures(p); return f.isTurret || f.isDome;});
      if(focused.length) ranked=focused;
    } else if(a.asksBullet){
      const focused=ranked.filter(p=>productFeatures(p).isBullet);
      if(focused.length) ranked=focused;
    }

    // Mantiene variantes W/B juntas sin impedir que el ranking principal mande.
    const byBase=new Map();
    ranked.forEach(p=>{if(!byBase.has(p._variantBase))byBase.set(p._variantBase,[]);byBase.get(p._variantBase).push(p);});
    const output=[],used=new Set();
    for(const p of ranked){
      if(used.has(p._variantBase)) continue;
      const group=byBase.get(p._variantBase).sort((a,b)=>b._score-a._score || (a._color==='white'?-1:1));
      group.forEach(x=>output.push(x)); used.add(p._variantBase);
      if(output.length>=limit) break;
    }
    return output.slice(0,limit);
  }

  global.HXA_KNOWLEDGE=KNOWLEDGE;
  global.HXA_KNOWLEDGE_ENGINE={normalize,expandQuery,scoreProduct,rank,variantBase,detectColor};
})(typeof window!=='undefined'?window:globalThis);
