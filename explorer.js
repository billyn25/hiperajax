/* =====================================================
   EXPLORER PRO · navegación directa y filtros dinámicos
   - Un toque: familia -> productos.
   - La clasificación procede exclusivamente del CSV.
   - Los filtros secundarios se muestran en un panel flotante.
   ===================================================== */
(function(){
  'use strict';

  const MOBILE_QUERY = '(max-width: 760px)';
  const POPULAR_REFS = [
    'AJ-HUB2-W','AJ-HUB2-B','AJ-HUB2-4G-W','AJ-HUB2-4G-B','AJ-HUB2PLUS-W','AJ-HUB2PLUS-B',
    'AJ-DOORPROTECT-W','AJ-DOORPROTECT-B','AJ-DOORPROTECTPLUS-W','AJ-MOTIONPROTECT-W','AJ-MOTIONPROTECT-B',
    'AJ-COMBIPROTECT-W','AJ-COMBIPROTECT-B','AJ-MOTIONCAM-W','AJ-MOTIONCAM-B','AJ-MOTIONCAM-PHOD-W',
    'AJ-HOMESIREN-W','AJ-HOMESIREN-B','AJ-STREETSIREN-W','AJ-STREETSIREN-B',
    'AJ-KEYPAD-W','AJ-KEYPAD-B','AJ-KEYPADPLUS-W','AJ-KEYPADPLUS-B','AJ-KEYPADCOMBI-W','AJ-KEYPADCOMBI-B',
    'AJ-FIREPROTECT2-HC-RB-W','AJ-FIREPROTECT2-H-RB-W','AJ-LEAKSPROTECT-W'
  ];

  const FAMILY_PRIORITY = [
    // Ajax inalámbrico: mantener el bloque junto.
    ['central','centrales','hub','hubs'],
    ['detector','detectores','intrusion','intrusión'],
    ['accesorios inalambricos','accesorios inalámbricos','sirena','sirenas','teclado','teclados','mando','mandos','boton','botón','botones','button','buttons'],
    ['kit inalambrico','kits inalambricos','kit inalámbrico','kits inalámbricos'],
    ['incendio','fuego','fire'],
    ['smart home','smarthome','domotica','domótica','automatizacion','automatización','confort'],
    // CCTV: cámaras primero y NVR profesionales inmediatamente después.
    ['camara ip','cámaras ip','camara','cámara','camaras','cámaras','videovigilancia'],
    ['nvr profesionales','nvr','grabador','grabadores','grabacion','grabación'],
    ['accesorios cctv'],
    ['discos duros','disco duro','hdd','hard drive'],
    ['kits cctv','kit cctv'],
    ['red','poe','network'],
    ['accesorio','accesorios','soporte','soportes'],
    ['alimentacion','alimentación','bateria','batería'],
    ['repuesto','repuestos','recambio','recambios'],
    ['almacenamiento nube','almacenamiento en nube','cloud storage','cloud','nube'],
    ['merchandising','merchan'],
    ['productos añadidos','productos anadidos']
  ];

  const KNOWN_FACETS = [
    { key:'subcategory', label:'Subfamilia', order:10 },
    { key:'color', label:'Color', order:20 },
    { key:'stock_state', label:'Stock', order:30 },
    { key:'technology', label:'Tecnología', order:40 },
    { key:'protocol', label:'Protocolo', order:45 },
    { key:'connectivity', label:'Conectividad', order:50 },
    { key:'product_type', label:'Tipo', order:55 },
    { key:'series', label:'Serie', order:60 },
    { key:'resolution', label:'Resolución máxima', order:70 },
    { key:'environment', label:'Uso / instalación', order:80 },
    { key:'photo', label:'Captura de imagen', order:90 },
    { key:'poe', label:'PoE', order:100 },
    { key:'wifi', label:'Wi‑Fi', order:110 },
    { key:'lte_4g', label:'4G / LTE', order:120 },
    { key:'compatibility', label:'Compatibilidad', order:130 },
    { key:'channels', label:'Canales / puertos', order:140 },
    { key:'lens', label:'Óptica', order:150 },
    { key:'mounting', label:'Montaje', order:160 },
    { key:'power', label:'Alimentación', order:170 },
    { key:'uso', label:'Uso', order:58 },
    { key:'tecnologia_deteccion', label:'Tecnología detección', order:62 },
    { key:'tipo_detector_pir', label:'Tipo detector PIR', order:64 },
    { key:'alcance_de_deteccion', label:'Alcance de detección', order:66 },
    { key:'alcance_deteccion', label:'Alcance de detección', order:66 },
    { key:'deteccion_de_incendio', label:'Detección de incendio', order:68 },
    { key:'deteccion_incendio', label:'Detección de incendio', order:68 },
    { key:'resolucion_maxima', label:'Resolución máxima', order:72 },
    { key:'tipo_lente', label:'Lente', order:152 }
  ];

  const KNOWN_FACET_MAP = new Map(KNOWN_FACETS.map(item => [item.key, item]));
  const CORE_FACETS = new Set(KNOWN_FACETS.map(item => item.key));
  const HIDDEN_ATTRIBUTE_KEYS = new Set([
    'name','brand','pvp','price','precio','description','short_description','image','stock','precio_neto_compra',
    'category','family','subcategory','product_type','series','technology','color','order','reference','referencia',
    'sku','ean','upc','manufacturer','fabricante','attributes','attributes_json','raw'
  ]);


  // Perfiles rápidos mantenibles. Solo existen en familias donde reducen pasos.
  // Los productos se asignan dinámicamente desde Tipo/atributos/nombre; nunca por listas de referencias.
  const QUICK_FILTER_ORDER = Object.freeze({
    cameras:['Bullet','Turret','Domo','Cube','PTZ','Soportes'],
    detectors:['Movimiento / PIR','Apertura','MotionCam','PhOD','Cristal','Inundación','Combi','Exterior','Cortina','Incendio','Hood / Viseras'],
    smart_home:['Interruptores','Enchufes','Timbre / Doorbell','Válvulas','Clima / Aire / LifeQuality','Frames','Cajas superficie','Tapas interruptor','Tapas enchufe'],
    centrals:['Hub','Hub 2','HUBBP','4G / LTE','Wi‑Fi','Hub Plus','Hybrid','Repetidores'],
    nvr:['4 canales','8 canales','16 canales','32+ canales','HDMI'],
    wireless_accessories:['Teclados','Tags / Cards','Sirenas','Relés','Botones / Mandos','Enchufes','Válvulas','Repetidores','LifeQuality','Transmitters','Hood / Viseras','Holder','SIM'],
    spares:['Brackets','Carcasas','Baterías','PCB','Lentes'],
    power_supply:['Pilas','Fuentes y Alimentadores','Inyectores PoE','Formato DIN'],
    ups:['UPS'],
    routers_mobile:['Routers','Licencias','Industrial'],
    unmanaged_switches:['4 puertos','5 puertos','8 puertos','16 puertos','24 puertos','48 puertos','PoE'],
    infrared_barriers:['Cableadas','Inalámbricas','Híbridas','Compatible Ajax','Solares'],
    racks_wall:['Racks']
  });

  const FACET_EQUIVALENT_GROUPS = Object.freeze([
    ['product_type','subcategory'],
    ['resolution','resolucion_maxima'],
    ['environment','uso'],
    ['lens','tipo_lente'],
    ['technology','tecnologia_deteccion'],
    ['alcance_de_deteccion','alcance_deteccion'],
    ['deteccion_de_incendio','deteccion_incendio']
  ]);

  const SEARCH_ALIAS_RULES = Object.freeze([
    {rx:/\b(leak|leaks|leakprotect|inundacion|inundación|fuga|fugas)\b/, add:'leak leakprotect inundacion inundación fuga agua detector'},
    {rx:/\b(sirena|sirenas|homesiren|streetsiren)\b/, add:'sirena sirenas homesiren streetsiren accesorios inalambricos'},
    {rx:/\b(teclado|teclados|keypad)\b/, add:'teclado teclados keypad keypadcombi keypadplus touchscreen accesorios inalambricos'},
    {rx:/\b(button|boton|botón|mando|mandos|spacecontrol|doublebutton)\b/, add:'button boton botón mando mandos spacecontrol doublebutton accesorios inalambricos'},
    {rx:/\b(rele|reles|relé|relés|relay|wallswitch|wall switch)\b/, add:'relay wallswitch rele relés domotica smart home'},
    {rx:/\b(keypadcombi|keypad combi|teclado combi)\b/, add:'keypad combi keypadcombi teclado teclados'},
    {rx:/\b(doorbell|timbre|videoportero)\b/, add:'doorbell timbre videoportero smart home'},
    {rx:/\b(phod|foto bajo demanda|fotosensor)\b/, add:'phod photo on demand foto bajo demanda motioncam fotosensor'},
    {rx:/\b(rex|rex2|repetidor|repetidores)\b/, add:'rex rex2 rex 2 repetidor repetidores'},
    {rx:/\b(4g|lte)\b/, add:'4g lte gsm hub central'},
    {rx:/\b(domo|dome)\b/, add:'domo dome camara'},
    {rx:/\b(turret)\b/, add:'turret camara'},
    {rx:/\b(soporte|soportes|mountcam|bracket)\b/, add:'soporte soportes mountcam bracket camara cctv'},
    {rx:/\b(bullet)\b/, add:'bullet camara'},
    {rx:/\b(combi|combiprotect)\b/, add:'combi combiprotect movimiento cristal'},
    {rx:/\b(cortina|curtain)\b/, add:'cortina curtain'},
    {rx:/\b(incendio|fire|humo)\b/, add:'incendio fire fireprotect humo smoke heat co'},
    {rx:/\b(lightcore|lightswitch|interruptor|interruptores)\b/, add:'lightcore lightswitch interruptor interruptores smart home domotica'},
    {rx:/\b(outletcore|socket|enchufe|enchufes)\b/, add:'outletcore socket outlet enchufe enchufes smart home domotica'},
    {rx:/\b(waterstop|valvula|válvula)\b/, add:'waterstop valvula válvula electroválvula'},
    {rx:/\b(button|doublebutton|spacecontrol|mando|mandos|boton|botón)\b/, add:'button doublebutton spacecontrol mando mandos boton botón'},
    {rx:/\b(lifequality|co2|calidad aire)\b/, add:'lifequality co2 temperatura humedad calidad aire'}
  ]);

  const collator = new Intl.Collator('es', { numeric:true, sensitivity:'base' });
  const esc = value => typeof escapeHtml === 'function'
    ? escapeHtml(String(value == null ? '' : value))
    : String(value == null ? '' : value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const clean = value => String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  const norm = value => (typeof normaliza === 'function' ? normaliza(value) : clean(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''));

  // Fuente única de metadatos de afinidad para el buscador común.
  // Solo sirve para ordenar candidatos ya encontrados.
  window.HXA_EXPLORER_SEARCH_META = Object.freeze({
    familyGroups:FAMILY_PRIORITY.map(group => group.map(value => norm(value))),
    aliases:SEARCH_ALIAS_RULES.map(rule => ({
      source:rule.rx.source,
      flags:rule.rx.flags,
      add:norm(rule.add)
    }))
  });
  const slug = value => norm(clean(value)).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'otros';
  const byId = id => document.getElementById(id);

  let state = freshState();
  let modelCache = null;
  let modelSignature = '';
  let searchTimer = null;
  let drawerDraft = {};
  let drawerQuickDraft = '';
  let lastFocused = null;
  let quickStripScrollLeft = 0;
  let budgetSummaryMinimized = false;

  function freshState(){
    return {
      view:'home',
      familyKey:'',
      query:'',
      sort:'price-ref',
      filters:{},
      quickGroup:'',
      drawerOpen:false,
      familyFilter:''
    };
  }

  function isMobile(){ return window.matchMedia(MOBILE_QUERY).matches; }

  function splitHierarchy(value){
    return clean(value).split(/\s*(?:>|\/|\\|\||»|›|→)\s*/).map(clean).filter(Boolean);
  }

  function inferredSubcategory(product){
    const source = clean(product?.short_description || product?.description);
    if(!source) return '';
    const parts = source.split(/\s+(?:-|–|—|·|\|)\s+/).map(clean).filter(Boolean);
    if(parts.length < 2) return '';
    const value = parts[0]
      .replace(/\bcolor\s+[a-záéíóúüñ]+.*$/i,'')
      .replace(/\btalla\s+[a-z0-9+.-]+.*$/i,'')
      .replace(/\s+/g,' ')
      .trim();
    return (!value || value.length < 3 || value.length > 55) ? '' : value;
  }

  function cleanAjaxLabel(value){
    return clean(value)
      .replace(/\bajax\b/gi,' ')
      .replace(/\bproductos?\s+de\b/gi,' ')
      .replace(/\s*[·|/\-]+\s*$/g,'')
      .replace(/^\s*[·|/\-]+\s*/g,'')
      .replace(/\s{2,}/g,' ')
      .trim();
  }

  function isGenericFamilyLabel(value){
    const v = norm(value);
    return !v || ['ajax','general','producto','productos','catalogo','catalogo ajax','otros'].includes(v);
  }

  function colorFacet(product){
    const explicit = getByAliases(product, ['color','colour','finish','acabado','color_producto']);
    if(explicit) return explicit;
    const attrs = normalizeAttributes(product);
    for(const [key,value] of Object.entries(attrs)){
      if(/color|colour|finish|acabado/.test(key) && clean(value)) return clean(value);
    }
    const text = norm(`${product?.name||''} ${product?.short_description||''} ${product?.description||''}`);
    if(/(?:^|[-_\s])w(?:$|[-_\s])/.test(text) || /\b(blanco|white)\b/.test(text)) return 'Blanco';
    if(/(?:^|[-_\s])b(?:$|[-_\s])/.test(text) || /\b(negro|black)\b/.test(text)) return 'Negro';
    if(/\b(gris|grey|gray)\b/.test(text)) return 'Gris';
    return '';
  }

  function technologyFacet(product){
    const explicit = getByAliases(product, ['technology','tecnologia','radio_technology','radiotechnology']);
    if(explicit) return explicit;
    const text = norm(`${product?.short_description||''} ${product?.description||''} ${product?.protocol||''} ${Object.values(normalizeAttributes(product)).join(' ')}`);
    const found = [];
    if(text.includes('jeweller')) found.push('Jeweller');
    if(text.includes('wings')) found.push('Wings');
    if(text.includes('fibra')) found.push('Fibra');
    return found.join(' | ');
  }

  function connectivityFacet(product){
    const explicit = getByAliases(product, ['connectivity','conectividad','connection','conexion','communications','comunicaciones']);
    if(explicit) return explicit;
    const text = norm(`${product?.short_description||''} ${product?.description||''} ${product?.wifi||''} ${product?.lte_4g||''} ${product?.poe||''} ${Object.values(normalizeAttributes(product)).join(' ')}`);
    const found = [];
    if(/\bwi[ -]?fi\b/.test(text)) found.push('Wi‑Fi');
    if(/\b4g\b|\blte\b/.test(text)) found.push('4G / LTE');
    if(/\bpoe\b/.test(text)) found.push('PoE');
    if(/\bethernet\b|\blan\b/.test(text)) found.push('Ethernet');
    if(/\bgsm\b|\b2g\b/.test(text)) found.push('2G / GSM');
    return [...new Set(found)].join(' | ');
  }

  // Copia deliberada de la clasificación funcional del primer Explorer.
  // La interfaz se aplana, pero los productos no se reclasifican.
  function classification(product){
    const manual = String(product?.origen_catalogo || '').toLowerCase() === 'manual';
    let category = clean(product?.category || product?.categoria || product?.department);
    let family = clean(product?.family || product?.familia);
    let subcategory = clean(
      product?.subcategory || product?.subfamily || product?.subfamilia || product?.product_type ||
      product?.tipo || product?.series || product?.serie || product?.technology || product?.tecnologia ||
      product?.protocol || product?.protocolo
    );

    const path = splitHierarchy(category);
    if(path.length > 1){
      category = path[0];
      if(!family) family = path[1];
      if(!subcategory && path[2]) subcategory = path.slice(2).join(' › ');
    }

    if(!subcategory) subcategory = inferredSubcategory(product);
    if(!category) category = manual ? 'Productos añadidos' : 'Sin categoría';
    if(!family) family = manual ? 'Productos añadidos' : 'General';

    const selectedRef = clean(product?.name).toUpperCase();
    if(['DS-1280ZJ-XS','DS-1280ZJ-XS-B'].includes(selectedRef)){
      return {
        category:'Ajax CCTV',
        family:'Accesorios',
        subcategory:'Soportes cámaras'
      };
    }

    const canonical = canonicalClassification(category, family, subcategory, selectedRef);
    return {
      category:canonical.category,
      family:canonical.family,
      subcategory:subcategory || 'Todos'
    };
  }

  function familyPriority(entry){
    const family = norm(entry.familyTitle);
    const category = norm(entry.categoryTitle);
    const text = norm(`${entry.familyTitle} ${entry.categoryTitle}`);

    // Familias CCTV: el orden se decide por la familia real, aunque el proveedor
    // entregue una categoría distinta o vacía. NVR siempre va tras Cámaras IP.
    if(/c[aá]maras?\s*ip|cameras?\s*ip|videovigilancia|camera/.test(text) && !/accesorio|kit|nvr|grabador/.test(text)) return 100;
    if(/nvr|grabador/.test(text)) return 101;
    if(/accesorios?\s*cctv/.test(text) || (/ajax cctv/.test(category) && /^accesorios?$/.test(family))) return 102;
    if(/kits?\s*cctv/.test(text) || (/ajax cctv/.test(category) && /^kits?$/.test(family))) return 103;

    // Ajax inalámbrico: mantener el bloque junto antes de CCTV.
    if(/ajax inalambrico/.test(category)){
      if(/^centrales?$|^hubs?$/.test(family)) return 0;
      if(/^detectores?$/.test(family)) return 10;
      if(/^accesorios?$/.test(family)) return 20;
      if(/^kits?$/.test(family)) return 30;
      if(/repuesto|repuestos|recambio|recambios/.test(text)) return 40;
      return 50;
    }

    if(/smart home|smarthome|domotica|domótica|automatizacion|automatización|confort/.test(text)) return 200;
    if(/discos? duros?|disco duro|surveillance/.test(text) && !/nube|cloud|tarjetas? sd/.test(text)) return 210;
    if(/tarjetas? sd|micro ?sd|microsd|sd card|memory card/.test(text)) return 211;
    if(/alimentacion|alimentación/.test(family)) return 212;
    if(/^sais?$|^ups$/.test(family)) return 213;
    if(/switches? no gestionables?|no gestionable|unmanaged/.test(text)) return 214;
    if(/routers?\s*3g|routers?\s*4g|routers?\s*5g|3g\/4g\/5g/.test(text)) return 215;
    if(/racks? de pared|rack wall|lockbox/.test(text)) return 216;
    if(/barreras? infrarrojas?|infrared barrier|photobeam/.test(text)) return 217;
    if(/almacenamiento|storage/.test(text) && !/nube|cloud/.test(text)) return 217;
    if(/repuesto|repuestos|recambio|recambios/.test(text)) return 220;
    if(/almacenamiento nube|almacenamiento en nube|cloud storage|\bnube\b|\bcloud\b/.test(text)) return 221;
    if(/merchandising|merchan/.test(text)) return 230;
    if(/productos añadidos|productos anadidos|otros productos/.test(text)) return 250;
    if(/incendio|fuego|fire|fireprotect/.test(text)) return 260;
    if(category.includes('sin categoria')) return 999;
    return 300;
  }

  function currentProducts(){ return Array.isArray(productos) ? productos : []; }

  function productSignature(){
    const list = currentProducts();
    let hash = 2166136261 >>> 0;

    // Hash only classification/search-relevant fields. ~600 products is cheap,
    // and prevents stale quick filters when Netlify/manual enrichment changes metadata.
    for(const p of list){
      const attrs = p?.attributes && typeof p.attributes === 'object'
        ? Object.entries(p.attributes).map(([k,v]) => `${k}:${v}`).join('|')
        : '';
      const text = [
        p?.name, p?.category, p?.categoria, p?.family, p?.familia,
        p?.subcategory, p?.subfamily, p?.product_type, p?.tipo,
        p?.short_description, p?.series, p?.technology,
        p?.environment, p?.photo, p?.channels, p?.connectivity,
        p?.wifi, p?.lte_4g, attrs
      ].filter(Boolean).join('¦');

      for(let i=0;i<text.length;i++){
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619) >>> 0;
      }
    }
    return `${list.length}|${hash.toString(16)}`;
  }

  function representativeProduct(family){
    const withImage = family.items.filter(item => clean(item.p?.image));
    if(!withImage.length) return family.items[0]?.p || null;
    const familyText = norm(`${family.familyTitle} ${family.categoryTitle}`);

    // Representantes comerciales fijados solo para la portada de familias.
    const wantedRef =
      /tarjetas? sd|micro ?sd|microsd|memory card/.test(familyText)
        ? 'HS-TF-D3STD/64G/NEO LUX/WW'
        : (/^alimentacion$|^alimentación$/.test(norm(family?.displayTitle||family?.familyTitle||'')) ? 'DC1210'
        : (/racks? de pared|rack wall/.test(familyText) ? 'RACK-WALL'
        : (/^sais?$|^ups$/.test(norm(family?.displayTitle||family?.familyTitle||'')) ? 'UPS1500VA-4'
        : (/routers? 3g|routers? 4g|routers? 5g|3g\/4g\/5g/.test(familyText) ? 'SF-ROUTER-4G-UPS-4P'
        : (/accesorio|accesorios/.test(familyText) && /inalambr|inalámbr|wireless/.test(familyText)
            ? 'AJ-HOMESIREN-B'
            : '')))));

    if(wantedRef){
      const wantedUpper = wantedRef.toUpperCase();
      const exact = withImage.find(item => clean(item.p?.name).toUpperCase() === wantedUpper)
        || (/^RACK-WALL$/.test(wantedUpper)
          ? withImage.find(item => clean(item.p?.name).toUpperCase().startsWith('RACK-WALL'))
          : null);
      if(exact) return exact.p;
    }

    const score = item => {
      const p = item.p || {};
      const t = norm(`${p.name||''} ${p.short_description||''} ${p.description||''} ${p.subcategory||''} ${p.product_type||''}`);
      let s = 0;
      const ref = clean(p.name).toUpperCase();
      if(/central|centrales|hub|hubs/.test(familyText) && ref === 'AJ-HUB-B') s += 1000;
      if(/nvr|grabador|grabacion|grabación/.test(familyText) && (ref === 'J-NVR108-DC-B' || ref === 'AJ-NVR108-DC-B')) s += 1000;
      if(/detector|detectores|intrusion|intrusión/.test(familyText) && ref === 'AJ-COMBIPROTECT-W') s += 1000;
      if(/kit/.test(familyText) && /inalambr|inalámbr/.test(familyText) && ref === 'AJ-HUBKIT-W') s += 1000;
      if(/smart home|smarthome|domotica|domótica|confort/.test(familyText) && ref === 'AJ-OUTLETCORE-BASIC') s += 1000;
      if(/accesorio|accesorios/.test(familyText) && /inalambr|inalámbr|wireless/.test(familyText) && /STREETSIREN/.test(ref)) s += 950;
      if(/repuesto|repuestos|recambio/.test(familyText) && /BRACKET/.test(ref)) s += 950;
      // Evitar que una familia se represente con un accesorio secundario.
      if(/soporte|bracket|mount|cable|adaptador|adapter|fuente|power supply|bateria|battery|carcasa|dummy|tapa|cover/.test(t)) s -= 30;
      if(/smart home|smarthome|domotica|domótica|confort/.test(familyText)){
        if(/lightcore|lightswitch/.test(t)) s += 100;
        if(/outletcore|outlet/.test(t)) s += 35;
      }
      if(/nvr|grabador|grabacion|grabación/.test(familyText)){
        if(/\bnvr\b|grabador/.test(t)) s += 100;
        if(/8ch|16ch|8 canales|16 canales/.test(t)) s += 15;
      }
      if(/repuesto|repuestos|recambio/.test(familyText)){
        if(/repuesto|spare|replacement|bateria|battery/.test(t)) s += 60;
        if(/kit|pack/.test(t)) s -= 15;
      }
      if(/merchandising|merchan/.test(familyText)){
        if(/gorra|cap|camiseta|shirt|sudadera|hoodie|mochila|backpack/.test(t)) s += 80;
      }
      return s;
    };
    return withImage.slice().sort((a,b) => score(b)-score(a))[0]?.p || withImage[0].p;
  }

  function canonicalClassification(categoryValue, familyValue, subcategoryValue='', referenceValue=''){
    if(/^(?:GAG1105PD|VDMS105GP|VDMS108GP|SW1008POE-100-E|SW0604POE-65-E|SF-SW0604HIPOE-60|SW8FE2FE-100W)$/i.test(clean(referenceValue))){
      return {category:'Networking', family:'Switches no gestionables'};
    }

    let category = clean(categoryValue);
    let family = clean(familyValue);
    const subcategory = clean(subcategoryValue);
    const c = norm(category);
    const f = norm(family);
    const combined = norm(`${category} ${family}`);
    const fullCombined = norm(`${category} ${family} ${subcategory}`);

    // Canonicalización SEMÁNTICA de pares categoría/familia.
    // No mueve productos por referencia: solo unifica nombres equivalentes del proveedor/manual.
    if(/detectores?/.test(combined) && /inalambr|inalámbr|wireless/.test(combined)){
      return {category:'Ajax Inalámbrico', family:'Detectores'};
    }
    if(/^detectores?$/.test(f) || /^detectores?$/.test(c)){
      return {category:'Ajax Inalámbrico', family:'Detectores'};
    }

    if(/accesorios?/.test(combined) && /inalambr|inalámbr|wireless/.test(combined)){
      return {category:'Ajax Inalámbrico', family:'Accesorios'};
    }
    if(/kits?/.test(combined) && /inalambr|inalámbr|wireless/.test(combined)){
      return {category:'Ajax Inalámbrico', family:'Kits'};
    }

    if(/accesorios?/.test(combined) && /cctv|video/.test(combined)){
      return {category:'Ajax CCTV', family:'Accesorios'};
    }
    if(/kits?/.test(combined) && /cctv|video/.test(combined)){
      return {category:'Ajax CCTV', family:'Kits'};
    }

    // Familias extra del proveedor: jerarquía completa, no referencias cerradas.
    if(/almacenamiento|storage/.test(fullCombined) && /tarjetas? sd|micro ?sd|microsd|sd card|memory card/.test(fullCombined)){
      return {category:'Accesorios IT y Seguridad', family:'Tarjetas SD'};
    }

    if(/almacenamiento|storage/.test(fullCombined) && /disco|hard drive|hdd|surveillance/.test(fullCombined)){
      return {category:'Accesorios IT y Seguridad', family:'Discos duros'};
    }

    if(/\bHD(?:1|2|3|4|6|8)TB(?:[-_][A-Z0-9]+)*\b/i.test(clean(referenceValue))){
      return {category:'Accesorios IT y Seguridad', family:'Discos duros'};
    }

    if(/alimentacion|alimentación/.test(fullCombined)
      && /baterias? y pilas|baterías? y pilas|fuentes? y alimentadores|power suppl/.test(fullCombined)){
      return {category:'Accesorios IT y Seguridad', family:'Alimentación'};
    }

    if(/(?:^|\s)sais?(?:\s|$)|(?:^|\s)ups(?:\s|$)|alimentacion ininterrumpida|alimentación ininterrumpida/.test(fullCombined)){
      return {category:'Accesorios IT y Seguridad', family:'SAIs'};
    }

    if(/networking|switching|switches/.test(fullCombined)
      && /no gestionable|unmanaged/.test(fullCombined)){
      return {category:'Networking', family:'Switches no gestionables'};
    }

    // Netlify ya limita esta rama a RACK-WALL y LOCKBOX mural.
    if(/racks?|armarios? rack/.test(fullCombined)){
      return {category:'Accesorios IT y Seguridad', family:'Racks de pared'};
    }

    if(/intrusion|intrusión/.test(fullCombined)
      && /barreras? infrarrojas?|infrared barrier|photobeam/.test(fullCombined)){
      return {category:'Intrusión', family:'Barreras infrarrojas'};
    }

    if(/networking|accesorios/.test(fullCombined) && /poe/.test(fullCombined)
      && /inyector|injector/.test(fullCombined)){
      return {category:'Accesorios IT y Seguridad', family:'Alimentación'};
    }

    if(/networking|routing/.test(fullCombined)
      && /routers?\s*3g|routers?\s*4g|routers?\s*5g|3g\/4g\/5g/.test(fullCombined)){
      return {category:'Networking', family:'Routers 3G/4G/5G'};
    }

    // Familias principales conocidas por su propio nombre.
    if(/centrales?|hubs?/.test(f)) return {category:category || 'Ajax Inalámbrico', family:'Centrales'};
    if(/\bnvrs?\b|grabador/.test(f)) return {category:category || 'Ajax CCTV', family:'NVRs'};
    if(/c[aá]maras?/.test(f)) return {category:category || 'Ajax CCTV', family:'Cámaras IP'};
    if(/smart home|smarthome|dom[oó]tica/.test(f)) return {category:category || 'Ajax', family:'Smart Home'};
    if(/repuestos?|recambios?/.test(f)) return {category:category || 'Ajax', family:'Repuestos'};
    if(/merchandising/.test(f)) return {category:category || 'Ajax', family:'Merchandising'};
    if(/nube|cloud/.test(f)) return {category:category || 'Servicios', family:'Nube'};

    return {category:category || 'Sin categoría', family:family || 'General'};
  }

  function buildModel(){
    const signature = productSignature();
    if(modelCache && modelSignature === signature) return modelCache;

    const categories = new Map();
    const allItems = [];
    currentProducts().forEach((product, index) => {
      const cls = classification(product);
      const categoryId = slug(cls.category);
      const familyId = slug(cls.family);
      const familyKey = `${categoryId}::${familyId}`;
      const item = {
        p:product,
        index,
        category:cls.category,
        family:cls.family,
        subcategory:cls.subcategory,
        familyKey
      };
      allItems.push(item);

      if(!categories.has(categoryId)){
        categories.set(categoryId, { id:categoryId, title:cls.category, families:new Map(), count:0 });
      }
      const category = categories.get(categoryId);
      category.count += 1;
      if(!category.families.has(familyId)){
        category.families.set(familyId, {
          key:familyKey,
          categoryId,
          categoryTitle:cls.category,
          familyId,
          familyTitle:cls.family,
          items:[],
          count:0
        });
      }
      const family = category.families.get(familyId);
      family.items.push(item);
      family.count += 1;
    });

    const families = [];
    categories.forEach(category => category.families.forEach(family => families.push(family)));
    families.sort((a,b) => familyPriority(a) - familyPriority(b)
      || collator.compare(a.familyTitle, b.familyTitle)
      || collator.compare(a.categoryTitle, b.categoryTitle));

    const duplicateNames = new Map();
    families.forEach(family => {
      const key = slug(family.familyTitle);
      duplicateNames.set(key, (duplicateNames.get(key) || 0) + 1);
    });
    families.forEach(family => {
      const cleanFamily = cleanAjaxLabel(family.familyTitle);
      const cleanCategory = cleanAjaxLabel(family.categoryTitle);
      let displayTitle = isGenericFamilyLabel(cleanFamily) ? cleanCategory : cleanFamily;
      if(isGenericFamilyLabel(displayTitle)){
        const candidate = family.items.map(item => cleanAjaxLabel(item.subcategory)).find(value => value && norm(value) !== 'todos');
        displayTitle = candidate || 'Otros productos';
      }
      if(norm(displayTitle) === 'productos anadidos' || norm(cleanCategory) === 'productos anadidos') displayTitle = 'Otros productos';
      const pair = norm(`${family.categoryTitle} ${family.familyTitle}`);
      if(/ajax inalambrico/.test(pair) && /^detectores$/.test(norm(family.familyTitle))) displayTitle = 'Detectores';
      else if(/ajax inalambrico/.test(pair) && /^accesorios$/.test(norm(family.familyTitle))) displayTitle = 'Accesorios inalámbricos';
      else if(/ajax inalambrico/.test(pair) && /^kits$/.test(norm(family.familyTitle))) displayTitle = 'Kits inalámbricos';
      else if(/ajax cctv/.test(pair) && /c[aá]maras?/.test(norm(family.familyTitle))) displayTitle = 'Cámaras IP';
      else if(/ajax cctv/.test(pair) && /^accesorios$/.test(norm(family.familyTitle))) displayTitle = 'Accesorios CCTV';
      else if(/ajax cctv/.test(pair) && /^kits$/.test(norm(family.familyTitle))) displayTitle = 'Kits CCTV';
      else if(/smart home|smarthome/.test(pair)) displayTitle = 'Domótica';
      else if(/^nvrs?$/.test(norm(family.familyTitle)) || /nvr|grabador/.test(norm(family.familyTitle))) displayTitle = 'NVR profesionales';
      else if(/^nube$/.test(norm(family.familyTitle))) displayTitle = 'Nube';
      family.displayTitle = displayTitle;
      family.context = displayTitle === 'Otros productos' ? 'Productos añadidos manualmente'
        : (cleanCategory && norm(cleanCategory) !== norm(displayTitle) ? cleanCategory : '');
      const representativeText = norm(`${family.displayTitle} ${family.familyTitle} ${family.categoryTitle}`);
      if(/tarjetas? sd|micro ?sd|microsd|memory card/.test(representativeText)){
        family.representative = representativeProduct(family);
      }else if(/discos? duros?|almacenamiento|storage/.test(representativeText)){
        family.representative = family.items
          .map(item => item.p)
          .find(product => clean(product?.image) && /visio/.test(clean(product?.origen_catalogo)))
          || family.items.map(item => item.p).find(product => clean(product?.image))
          || representativeProduct(family);
      }else{
        family.representative = representativeProduct(family);
      }
    });



    const byFamily = new Map(families.map(family => [family.key, family]));
    modelCache = { allItems, families, byFamily };
    modelSignature = signature;
    return modelCache;
  }

  function hxIsNewProduct(product){
    const ref=clean(product?.name).toUpperCase();
    return Boolean(ref && window.HX_PRODUCTOS_NUEVOS && window.HX_PRODUCTOS_NUEVOS[ref]);
  }

  function newProductsFamily(model = buildModel()){
    const items=model.allItems.filter(item=>hxIsNewProduct(item.p));
    return {
      key:'__new__',
      familyTitle:'Nuevos',
      categoryTitle:'Nuevos',
      displayTitle:'Nuevos',
      context:'Productos detectados en las últimas actualizaciones',
      items,
      count:items.length,
      newOnly:true
    };
  }

  function currentFamily(model = buildModel()){
    if(state.familyKey === '__new__') return newProductsFamily(model);
    if(state.familyKey === '__popular__') return popularFamily(model);
    if(state.familyKey === '__all__'){
      return {
        key:'__all__',
        familyTitle:'Todos los productos',
        categoryTitle:'Todos los productos',
        context:'Todos los productos Ajax',
        items:model.allItems.slice(),
        count:model.allItems.length,
        all:true
      };
    }
    return model.byFamily.get(state.familyKey) || null;
  }

  function popularFamily(model){
    const refMap=new Map(model.allItems.map(item=>[clean(item.p?.name).toUpperCase(),item]));
    const items=[];
    try{
      const usage=typeof limpiarUsoProductosInexistentes206==='function'
        ? limpiarUsoProductosInexistentes206(currentProducts())
        : (typeof leerUsoProductos206==='function'?leerUsoProductos206():{});
      Object.entries(usage||{})
        .sort((a,b)=>(Number(b[1]?.count)||0)-(Number(a[1]?.count)||0)||String(b[1]?.last||'').localeCompare(String(a[1]?.last||'')))
        .slice(0,24)
        .forEach(([ref])=>{ const item=refMap.get(clean(ref).toUpperCase()); if(item) items.push(item); });
    }catch(_error){}
    return {key:'__popular__',familyTitle:'Más usados',categoryTitle:'Acceso rápido',context:'Usados en los últimos 30 días',items,count:items.length,popular:true};
  }

  function familyItems(model = buildModel()){
    const family = currentFamily(model);
    return family ? family.items.slice() : model.allItems.slice();
  }

  function safeDescription(product){
    let fallback = clean(product?.description);
    try{
      const data = typeof descripcionProducto === 'function' ? descripcionProducto(product) : null;
      fallback = clean(data?.desc) || fallback;
    }catch(_error){}
    try{
      if(typeof hxDescripcionCortaProducto === 'function') return clean(hxDescripcionCortaProducto(product, fallback));
    }catch(_error){}
    return clean(product?.short_description) || fallback;
  }


  function longDescription(product){
    const full=clean(product?.description || '');
    const short=safeDescription(product);
    if(!full || norm(full) === norm(short)) return '';
    return full;
  }


  function rankedSearch(items, query){
    const q = clean(query);
    if(!q) return items.slice();
    if(q.length < 3) return [];

    const engine = window.HXA_COMMON_SEARCH || window.HXA_SEARCH_ENGINE;
    if(!engine?.rows) return [];

    const model = buildModel();

    // Global: mismo array y mismo orden que Inicio.
    if(!state.familyKey && !state.quickGroup && !Object.keys(state.filters || {}).length){
      const byIndex = new Map(model.allItems.map(item => [Number(item.index), item]));
      return engine.rows(productos, q, 300)
        .map(row => byIndex.get(Number(row.i)))
        .filter(Boolean);
    }

    // Contexto: mismo motor sobre el subconjunto visible.
    // Conservamos un mapa explícito row.i -> item para NO perder el orden.
    const source = [];
    const sourceItems = [];

    for(const item of items){
      const product = productos[item.index] || item.p;
      if(!product) continue;
      source.push(product);
      sourceItems.push(item);
    }

    return engine.rows(source, q, Math.min(300, source.length))
      .map(row => sourceItems[Number(row.i)])
      .filter(Boolean);
  }

  function stockFacet(product){
    let status = { visible:false, clase:'', texto:'' };
    try{ status = typeof hxEstadoStock === 'function' ? hxEstadoStock(product?.stock) : status; }catch(_error){}
    if(!status.visible) return '';
    if(status.clase === 'is-ok') return 'Disponible';
    if(status.clase === 'is-none') return 'Sin stock';
    return 'Stock limitado';
  }

  function boolFacet(value, positiveLabel='Sí', negativeLabel='No'){
    const raw = norm(value).replace(/[^a-z0-9]+/g,'');
    if(!raw) return '';
    if(['1','yes','si','true','included','incluido','available','disponible'].includes(raw)) return positiveLabel;
    if(['0','no','false','none','notincluded','noincluido','unavailable'].includes(raw)) return negativeLabel;
    return clean(value);
  }

  function getByAliases(product, aliases){
    for(const key of aliases){
      const value = product?.[key];
      if(value !== undefined && value !== null && clean(value) !== '') return clean(value);
    }
    return '';
  }

  function normalizeAttributes(product){
    const result = {};
    const source = product?.attributes;
    if(source && typeof source === 'object' && !Array.isArray(source)){
      Object.entries(source).forEach(([key,value]) => {
        const cleanKey = slug(key).replace(/-/g,'_');
        const cleanValue = clean(value);
        if(cleanKey && cleanValue && !HIDDEN_ATTRIBUTE_KEYS.has(cleanKey)) result[cleanKey] = cleanValue;
      });
    }
    return result;
  }

  function facetValues(item){
    const product = item.p || {};
    const values = {
      subcategory:item.subcategory && norm(item.subcategory) !== 'todos' ? clean(item.subcategory) : '',
      color:colorFacet(product),
      stock_state:stockFacet(product),
      technology:technologyFacet(product),
      protocol:getByAliases(product, ['protocol','protocolo']),
      connectivity:connectivityFacet(product),
      product_type:getByAliases(product, ['product_type','tipo','type']),
      series:getByAliases(product, ['series','serie']),
      resolution:getByAliases(product, ['resolution','resolucion','megapixels','megapixeles']),
      environment:getByAliases(product, ['environment','entorno','installation','instalacion','indoor_outdoor','interior_exterior']),
      photo:boolFacet(getByAliases(product, ['photo','foto','image_capture','captura_imagen']), 'Con foto', 'Sin foto'),
      poe:boolFacet(getByAliases(product, ['poe','power_over_ethernet']), 'Con PoE', 'Sin PoE'),
      wifi:boolFacet(getByAliases(product, ['wifi','wi_fi']), 'Con Wi‑Fi', 'Sin Wi‑Fi'),
      lte_4g:boolFacet(getByAliases(product, ['lte_4g','lte','4g','gsm']), 'Con 4G / LTE', 'Sin 4G / LTE'),
      compatibility:getByAliases(product, ['compatibility','compatibilidad']),
      channels:getByAliases(product, ['channels','canales','ports','puertos']),
      lens:getByAliases(product, ['lens','lente','focal_length','distancia_focal']),
      mounting:getByAliases(product, ['mounting','montaje','mount','soporte']),
      power:getByAliases(product, ['power','alimentacion','voltage','voltaje'])
    };
    const attrs = normalizeAttributes(product);
    Object.entries(attrs).forEach(([key,value]) => {
      if(!values[key]) values[key] = value;
    });
    return values;
  }

  function splitFacetValues(raw){
    const value = clean(raw);
    if(!value) return [];
    // Se separan únicamente listas claras; las expresiones "Interior/Exterior" permanecen juntas.
    return value.split(/\s*(?:\||;|•)\s*/).map(clean).filter(Boolean);
  }

  function prettifyKey(key){
    const known = KNOWN_FACET_MAP.get(key);
    if(known) return known.label;
    const aliases = {
      uso:'Uso',
      resolucion_maxima:'Resolución máxima',
      tecnologia_deteccion:'Tecnología detección',
      tipo_detector_pir:'Tipo detector PIR',
      alcance_de_deteccion:'Alcance de detección',
      alcance_deteccion:'Alcance de detección',
      deteccion_de_incendio:'Detección de incendio',
      deteccion_incendio:'Detección de incendio',
      tipo_lente:'Lente'
    };
    if(aliases[key]) return aliases[key];
    return clean(key.replace(/[_-]+/g,' ')).replace(/\b\w/g, char => char.toUpperCase());
  }

  function buildFacets(items, options = {}){
    const maps = new Map();
    items.forEach(item => {
      const values = facetValues(item);
      Object.entries(values).forEach(([key,raw]) => {
        splitFacetValues(raw).forEach(value => {
          if(!maps.has(key)) maps.set(key, new Map());
          const valueKey = slug(value);
          const map = maps.get(key);
          if(!map.has(valueKey)) map.set(valueKey, { id:valueKey, title:value, count:0 });
          map.get(valueKey).count += 1;
        });
      });
    });

    const groups = [];
    maps.forEach((valueMap,key) => {
      const values = [...valueMap.values()]
        .sort((a,b) => b.count - a.count || collator.compare(a.title,b.title));
      const isCore = CORE_FACETS.has(key);
      const includeSingle = options.includeSingleKeys instanceof Set && options.includeSingleKeys.has(key);
      if(values.length < 2 && !includeSingle) return;
      if(!isCore && values.length > 30) return;
      groups.push({
        key,
        label:prettifyKey(key),
        order:KNOWN_FACET_MAP.get(key)?.order ?? 500,
        values
      });
    });
    const sorted = groups.sort((a,b) => a.order - b.order || collator.compare(a.label,b.label));
    const byKey = new Map(sorted.map(group => [group.key,group]));
    const hidden = new Set();

    FACET_EQUIVALENT_GROUPS.forEach(keys => {
      const available = keys.map(key => byKey.get(key)).filter(Boolean);
      if(available.length < 2) return;
      const signature = group => group.values.map(value => value.id).sort().join('|');
      const primary = available[0];
      available.slice(1).forEach(group => {
        if(signature(group) === signature(primary)) hidden.add(group.key);
      });
    });

    return sorted.filter(group => !hidden.has(group.key));
  }


  function activeFilterCount(filters = state.filters){
    return Object.values(filters || {}).reduce((total,values) => total + (Array.isArray(values) ? values.length : 0), 0);
  }

  function itemMatchesFilters(item, filters){
    const selectedGroups = Object.entries(filters || {}).filter(([,values]) => Array.isArray(values) && values.length);
    if(!selectedGroups.length) return true;
    const values = facetValues(item);
    return selectedGroups.every(([key,selected]) => {
      const available = splitFacetValues(values[key]).map(slug);
      return selected.some(value => available.includes(value));
    });
  }

  function applyFilters(items, filters = state.filters){ return items.filter(item => itemMatchesFilters(item, filters)); }

  function featuredRank(item){
    const product = item.p || {};
    const order = Number(product.order || 0);
    if(Number.isFinite(order) && order > 0) return order;
    const ref = clean(product.name).toUpperCase();
    const popularIndex = POPULAR_REFS.indexOf(ref);
    return popularIndex >= 0 ? 100 + popularIndex : 10000;
  }

  function defaultSortForFamily(key){
    if(!key || key === '__all__' || key === '__popular__') return 'price-ref';
    const family = buildModel().byFamily.get(key);
    const text = norm(`${family?.displayTitle||''} ${family?.familyTitle||''} ${family?.categoryTitle||''}`);

    // Familias donde comparar precio es más útil comercialmente.
    if(/camara|cámara|detector/.test(text)) return 'price-ref';

    // Domótica: mantener juntas las variantes de la misma referencia y color.
    if(/smart home|smarthome|domotica|domótica|automatizacion|automatización|confort/.test(text)) return 'ref-color';

    if(/central|hub|sirena|teclado/.test(text)) return 'ref-color';

    // SAIs: referencias agrupadas y ordenadas de forma estable.
    if(/^sais?$|^ups$/.test(norm(family?.displayTitle||family?.familyTitle||''))) return 'ref';

    // Productos añadidos/manuales: mantener referencias relacionadas juntas.
    if(/otros productos|productos anadidos|productos añadidos/.test(text)) return 'ref';

    return 'price-ref';
  }

  function compareColor(a,b){
    const colorOrder = value => {
      const v = norm(value);
      if(v.includes('blanco') || v.includes('white')) return 0;
      if(v.includes('negro') || v.includes('black')) return 1;
      if(v.includes('gris') || v.includes('grey') || v.includes('gray')) return 2;
      return v ? 3 : 9;
    };
    return colorOrder(colorFacet(a.p)) - colorOrder(colorFacet(b.p))
      || collator.compare(colorFacet(a.p), colorFacet(b.p));
  }

  function sortItems(items){
    const list = items.slice();
    if(state.sort === 'type-ref-color'){
      return list.sort((a,b) => collator.compare(a.subcategory || '', b.subcategory || '')
        || collator.compare(a.p?.name || '', b.p?.name || '')
        || compareColor(a,b));
    }
    if(state.sort === 'ref-color'){
      return list.sort((a,b) => collator.compare(a.p?.name || '', b.p?.name || '') || compareColor(a,b));
    }
    if(state.sort === 'price-ref'){
      return list.sort((a,b) => {
        const ap = Number(a.p?.pvp) || 0, bp = Number(b.p?.pvp) || 0;
        if(!ap && bp) return 1;
        if(ap && !bp) return -1;
        return ap - bp || collator.compare(a.p?.name || '', b.p?.name || '');
      });
    }
    if(state.sort === 'price-color'){
      const colorOrder = value => {
        const v = norm(value);
        if(v.includes('blanco') || v.includes('white')) return 0;
        if(v.includes('negro') || v.includes('black')) return 1;
        if(v.includes('gris') || v.includes('grey') || v.includes('gray')) return 2;
        return v ? 3 : 9;
      };
      return list.sort((a,b) => {
        const ap = Number(a.p?.pvp) || 0;
        const bp = Number(b.p?.pvp) || 0;
        if(!ap && bp) return 1;
        if(ap && !bp) return -1;
        return ap - bp
          || colorOrder(colorFacet(a.p)) - colorOrder(colorFacet(b.p))
          || collator.compare(colorFacet(a.p), colorFacet(b.p))
          || collator.compare(a.p?.name || '', b.p?.name || '');
      });
    }
    if(state.sort === 'price-asc'){
      return list.sort((a,b) => {
        const ap = Number(a.p?.pvp) || 0;
        const bp = Number(b.p?.pvp) || 0;
        if(!ap && bp) return 1;
        if(ap && !bp) return -1;
        return ap - bp || collator.compare(a.p?.name || '', b.p?.name || '');
      });
    }
    if(state.sort === 'price-desc') return list.sort((a,b) => (Number(b.p?.pvp)||0) - (Number(a.p?.pvp)||0) || collator.compare(a.p?.name||'',b.p?.name||''));
    if(state.sort === 'name') return list.sort((a,b) => collator.compare(safeDescription(a.p), safeDescription(b.p)));
    if(state.sort === 'ref') return list.sort((a,b) => collator.compare(a.p?.name || '', b.p?.name || ''));
    if(state.sort === 'stock'){
      const weight = item => ({'Disponible':0,'Stock limitado':1,'Sin stock':2,'':3}[stockFacet(item.p)] ?? 3);
      return list.sort((a,b) => weight(a)-weight(b) || featuredRank(a)-featuredRank(b) || collator.compare(a.p?.name||'',b.p?.name||''));
    }
    return list.sort((a,b) => featuredRank(a)-featuredRank(b) || collator.compare(a.p?.name || '', b.p?.name || ''));
  }


  function definitionItemsForQuick(quickGroup = state.quickGroup, family = currentFamily(), model = buildModel()){
    const related=relatedQuickItems(quickGroup,family,model);
    let items = Array.isArray(related) ? related.slice() : (family ? family.items.slice() : model.allItems.slice());
    if(clean(state.query)) items = rankedSearch(items, state.query);
    return items;
  }

  function filterBaseItems(quickGroup = state.quickGroup){
    const family = currentFamily();
    let items = definitionItemsForQuick(quickGroup, family);
    if(quickGroup && !isRelatedQuickGroup(quickGroup, family)){
      items = items.filter(item => quickGroupsForItem(item, family).includes(quickGroup));
    }
    return items;
  }

  function buildContextualFacets(definitionItems, filters = {}, quickGroup = state.quickGroup, familyOverride = null){
    const selectedKeys = new Set(Object.entries(filters).filter(([,values]) => Array.isArray(values) && values.length).map(([key]) => key));
    const definitions = buildFacets(definitionItems, {includeSingleKeys:selectedKeys});
    const family = familyOverride || currentFamily();
    const quickItems = quickGroup
      ? (isRelatedQuickGroup(quickGroup, family)
          ? definitionItems
          : definitionItems.filter(item => quickGroupsForItem(item, family).includes(quickGroup)))
      : definitionItems;

    return definitions.map(group => {
      const otherFilters = {...filters};
      delete otherFilters[group.key];
      const contextItems = applyFilters(quickItems, otherFilters);
      const counts = new Map();

      contextItems.forEach(item => {
        const values = facetValues(item);
        splitFacetValues(values[group.key]).forEach(value => {
          const id = slug(value);
          counts.set(id, (counts.get(id) || 0) + 1);
        });
      });

      const selected = filters[group.key] || [];
      return {
        ...group,
        values:group.values.map(value => ({...value,count:counts.get(value.id)||0}))
      };
    }).filter(group => group.values.length >= 2 || (filters[group.key] || []).length);
  }

  function resultItems(filters = state.filters, quickGroup = state.quickGroup){
    let items = filterBaseItems(quickGroup);
    items = applyFilters(items, filters);

    // Con búsqueda activa, el orden del motor común es final.
    if(clean(state.query)) return items;

    return sortItems(items);
  }

  function availableFamilyList(model){
    const needle = norm(state.familyFilter);
    if(!needle) return model.families;
    return model.families.filter(family => norm(`${family.familyTitle} ${family.categoryTitle}`).includes(needle));
  }

  function svgIcon(name){
    const paths = {
      search:'<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path>',
      filter:'<path d="M4 6h16M7 12h10M10 18h4"></path>',
      sort:'<path d="M8 4v16m0 0-3-3m3 3 3-3M16 20V4m0 0-3 3m3-3 3 3"></path>',
      back:'<path d="m15 18-6-6 6-6"></path>',
      close:'<path d="M6 6l12 12M18 6 6 18"></path>',
      box:'<path d="m4 7 8-4 8 4-8 4z"></path><path d="M4 7v10l8 4 8-4V7M12 11v10"></path>',
      chevron:'<path d="m9 6 6 6-6 6"></path>',
      clear:'<path d="M5 12h14"></path>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ''}</svg>`;
  }

  function headerSearch(){
    const scope = state.familyKey ? (currentFamily()?.familyTitle || 'familia') : 'todos los productos';
    const placeholder = isMobile()
      ? (state.familyKey ? `Buscar en ${scope}…` : 'Buscar producto…')
      : (state.familyKey ? `Buscar dentro de ${scope}…` : 'Buscar referencia, descripción o producto…');
    return `<label class="hxp-search" for="hxpSearch">
      <span class="hxp-search-icon">${svgIcon('search')}</span>
      <input id="hxpSearch" type="search" autocomplete="off" spellcheck="false" placeholder="${esc(placeholder)}" value="${esc(state.query)}">
      ${state.query ? `<button type="button" class="hxp-search-clear" data-hxp-clear-search aria-label="Limpiar búsqueda">${svgIcon('close')}</button>` : ''}
    </label>`;
  }

  function sortControl(){
    const searching = Boolean(clean(state.query));

    if(searching){
      return `<label class="hxp-sort is-search-relevance" title="Durante una búsqueda, los resultados se ordenan por relevancia">
        <span>Orden</span>
        <select id="hxpSort" data-hxp-sort-control aria-label="Orden de resultados" disabled>
          <option selected>Relevancia</option>
        </select>
      </label>`;
    }

    return `<label class="hxp-sort">
      <span>Orden</span>
      <select id="hxpSort" data-hxp-sort-control aria-label="Ordenar productos">
        <option value="price-ref" ${state.sort==='price-ref'?'selected':''}>Precio + referencia</option>
        <option value="ref-color" ${state.sort==='ref-color'?'selected':''}>Referencia + color</option>
        <option value="type-ref-color" ${state.sort==='type-ref-color'?'selected':''}>Tipo + referencia</option>
        <option value="price-color" ${state.sort==='price-color'?'selected':''}>Precio + color</option>
        <option value="featured" ${state.sort==='featured'?'selected':''}>Más usados</option>
        <option value="price-asc" ${state.sort==='price-asc'?'selected':''}>Precio: menor</option>
        <option value="price-desc" ${state.sort==='price-desc'?'selected':''}>Precio: mayor</option>
        <option value="stock" ${state.sort==='stock'?'selected':''}>Stock</option>
        <option value="ref" ${state.sort==='ref'?'selected':''}>Referencia</option>
        <option value="name" ${state.sort==='name'?'selected':''}>Descripción</option>
      </select>
    </label>`;
  }
  function toolbar(resultCount, options = {}){
    const showTools = options.showTools !== false;
    const filters = activeFilterCount();
    return `<div class="hxp-toolbar ${showTools?'':'hxp-toolbar-home'}">
      ${headerSearch()}
      <div class="hxp-toolbar-actions">
        <span class="hxp-result-count" aria-live="polite"><strong>${resultCount}</strong> producto${resultCount===1?'':'s'}</span>
        ${showTools ? `<button type="button" class="hxp-filter-button ${filters?'is-active':''}" data-hxp-open-filters>
          ${svgIcon('filter')}<span>Filtros</span>${filters?`<b>${filters}</b>`:''}
        </button>${sortControl()}` : ''}
      </div>
    </div>`;
  }

  function compactSortControl(){
    const searching = Boolean(clean(state.query));
    const options = searching
      ? '<option selected>Relevancia</option>'
      : `<option value="price-ref" ${state.sort==='price-ref'?'selected':''}>Precio + referencia</option>
        <option value="ref-color" ${state.sort==='ref-color'?'selected':''}>Referencia + color</option>
        <option value="type-ref-color" ${state.sort==='type-ref-color'?'selected':''}>Tipo + referencia</option>
        <option value="price-color" ${state.sort==='price-color'?'selected':''}>Precio + color</option>
        <option value="featured" ${state.sort==='featured'?'selected':''}>Más usados</option>
        <option value="price-asc" ${state.sort==='price-asc'?'selected':''}>Precio: menor</option>
        <option value="price-desc" ${state.sort==='price-desc'?'selected':''}>Precio: mayor</option>
        <option value="stock" ${state.sort==='stock'?'selected':''}>Stock</option>
        <option value="ref" ${state.sort==='ref'?'selected':''}>Referencia</option>
        <option value="name" ${state.sort==='name'?'selected':''}>Descripción</option>`;
    return `<label class="hxp-mobile-sort ${searching?'is-disabled':''}" title="Ordenar productos">
      <span aria-hidden="true">${svgIcon('sort')}</span>
      <select data-hxp-sort-control aria-label="Ordenar productos" ${searching?'disabled':''}>${options}</select>
    </label>`;
  }

  function mobileCompactBar(resultCount, family){
    const filters = activeFilterCount();
    const title = family ? visibleFamilyTitle(family) : (clean(state.query) ? 'Resultados' : 'Productos');
    return `<div class="hxp-mobile-compact-bar" aria-label="Controles compactos de Explorer">
      <button type="button" class="hxp-mobile-compact-back" data-hxp-home aria-label="Volver a familias">${svgIcon('back')}</button>
      <div class="hxp-mobile-compact-title"><strong>${esc(title)}</strong><em>${resultCount}</em></div>
      <button type="button" class="hxp-mobile-compact-filter ${filters?'is-active':''}" data-hxp-open-filters aria-label="Abrir filtros">${svgIcon('filter')}${filters?`<b>${filters}</b>`:''}</button>
      ${compactSortControl()}
      <button type="button" class="hxp-mobile-compact-close" data-hxp-close-explorer aria-label="Cerrar Explorer">${svgIcon('close')}</button>
    </div>`;
  }

  function visibleFamilyTitle(family){
    const raw = clean(family?.displayTitle || family?.familyTitle || '');
    const identity = norm(`${raw} ${family?.familyTitle||''} ${family?.categoryTitle||''}`);
    if(/smart home|smarthome/.test(identity)) return 'Domótica';
    return raw;
  }

  function familyVisual(family){
    if(norm(family?.displayTitle) === 'otros productos'){
      return `<span class="hxp-family-visual"><b>O</b></span>`;
    }
    const product = family?.representative || null;
    const image = clean(product?.image);
    if(image){
      return `<span class="hxp-family-visual hxp-family-visual-image"><img src="${esc(image)}" alt="" loading="lazy" onerror="this.closest('.hxp-family-visual').classList.add('is-error')"><b>${esc((visibleFamilyTitle(family)||'?').slice(0,1).toUpperCase())}</b></span>`;
    }
    return `<span class="hxp-family-visual"><b>${esc((visibleFamilyTitle(family)||'?').slice(0,1).toUpperCase())}</b></span>`;
  }

  function homeView(){
    const model = buildModel();
    const families = availableFamilyList(model);
    const total = model.allItems.length;
    const familyCards = families.map(family => `
      <button type="button" class="hxp-family-card" data-hxp-family="${esc(family.key)}">
        ${familyVisual(family)}
        <span class="hxp-family-copy">
          <strong>${esc(visibleFamilyTitle(family))}</strong>
          ${family.context ? `<small>${esc(family.context)}</small>` : '<small>Ver productos</small>'}
        </span>
        <em>${family.count}</em>
        <span class="hxp-family-arrow">${svgIcon('chevron')}</span>
      </button>`).join('');

    return `${toolbar(total, {showTools:false})}
      <main class="hxp-main hxp-home">
        <div class="hxp-home-heading">
          <div><h3>Elige una familia</h3><p>Un toque abre directamente sus productos.</p></div>
          <label class="hxp-family-search">
            ${svgIcon('search')}
            <input id="hxpFamilyFilter" autocomplete="off" placeholder="Filtrar familias…" value="${esc(state.familyFilter)}">
          </label>
        </div>
        <div class="hxp-family-grid">
          ${newProductsFamily(model).count ? `<button type="button" class="hxp-family-card hxp-family-card-new" data-hxp-family="__new__">
            <span class="hxp-family-visual hxp-family-visual-special"><b>NEW</b></span><span class="hxp-family-copy"><strong>Nuevos</strong><small>Revisar altas y su clasificación automática</small></span>
            <em>${newProductsFamily(model).count}</em><span class="hxp-family-arrow">${svgIcon('chevron')}</span>
          </button>` : ''}
          <button type="button" class="hxp-family-card hxp-family-card-popular" data-hxp-family="__popular__">
            <span class="hxp-family-visual hxp-family-visual-special"><b>★</b></span><span class="hxp-family-copy"><strong>Más usados</strong><small>Tus referencias habituales primero</small></span>
            <em>${popularFamily(model).count}</em><span class="hxp-family-arrow">${svgIcon('chevron')}</span>
          </button>
          <button type="button" class="hxp-family-card hxp-family-card-all" data-hxp-family="__all__">
            <span class="hxp-family-visual hxp-family-visual-special"><b>∞</b></span><span class="hxp-family-copy"><strong>Todos los productos</strong><small>Ver el catálogo completo</small></span>
            <em>${total}</em><span class="hxp-family-arrow">${svgIcon('chevron')}</span>
          </button>
          ${familyCards || '<div class="hxp-empty">No hay familias con ese texto.</div>'}
        </div>
      </main>`;
  }


  function familyQuickProfile(family){
    const text = norm(`${family?.displayTitle||''} ${family?.familyTitle||''} ${family?.categoryTitle||''}`);
    if(/repuesto|repuestos|recambio|recambios/.test(text)) return 'spares';
    if(/^sais?$|^ups$/.test(norm(family?.displayTitle||family?.familyTitle||''))) return 'ups';
    if(/routers? 3g|routers? 4g|routers? 5g|3g\/4g\/5g/.test(text)) return 'routers_mobile';
    if(/switches? no gestionables?|no gestionable|unmanaged/.test(text)) return 'unmanaged_switches';
    if(/alimentacion|alimentación/.test(text) && !/nube|cloud/.test(text)) return 'power_supply';
    if(/accesorio|accesorios/.test(text) && /inalambr|inalámbr|wireless/.test(text)) return 'wireless_accessories';
    if(/barreras? infrarrojas?|infrared barrier|photobeam/.test(text)) return 'infrared_barriers';
    if(/racks? de pared|rack wall|lockbox/.test(text)) return 'racks_wall';
    if(/camara|cámara/.test(text)) return 'cameras';
    if(/detector|detectores|intrusion|intrusión/.test(text)) return 'detectors';
    if(/smart home|smarthome|domotica|domótica|automatizacion|automatización|confort/.test(text)) return 'smart_home';
    if(/\bnvrs?\b|grabador|grabacion|grabación/.test(text)) return 'nvr';
    if(/tarjetas? sd|micro ?sd|microsd|sd card|memory card/.test(text)) return 'sd_storage';
    if(/discos? duros?|hard drives?|almacenamiento|storage/.test(text)) return 'storage';
    if(/central|centrales|\bhub\b|hubs/.test(text)) return 'centrals';
    return '';
  }

  const QUICK_SIGNAL_RULES = Object.freeze([
    ['motioncam', /motioncam/], ['curtain', /curtain/], ['outdoor', /outdoor/], ['phod', /phod/],
    ['doorprotect', /doorprotect/], ['glassprotect', /glassprotect/], ['combiprotect', /combiprotect/],
    ['fireprotect', /fireprotect/], ['leakprotect', /leaks?protect|leakprotect/],
    ['keypad', /keypad/], ['homesiren', /homesiren/], ['streetsiren', /streetsiren/],
    ['wallswitch', /wallswitch/], ['relay', /relay/], ['spacecontrol', /spacecontrol/],
    ['doublebutton', /doublebutton/], ['button', /(?:^|aj)button/], ['socket', /socket/],
    ['waterstop', /waterstop/], ['lifequality', /lifequality/],
    ['hub2plus', /hub2plus/], ['hub2', /hub2/], ['hub', /hub/], ['4g', /4g/], ['lte', /lte/],
    ['rex2', /rex2/], ['rex', /(?:^|aj)rex/], ['bullet', /bullet/], ['turret', /turret/],
    ['dome', /dome/], ['ptz', /ptz/], ['nvr', /nvr/], ['hdmi', /hdmi/]
  ]);

  function quickReferenceSignals(product){
    const compact = norm(product?.name || '').replace(/[^a-z0-9]/g,'');
    if(!compact) return '';
    const found = [];
    QUICK_SIGNAL_RULES.forEach(([label,rx]) => {
      if(rx.test(compact) && !found.includes(label)) found.push(label);
    });
    return found.join(' ');
  }

  function quickContext(item){
    const p = item?.p || {};
    const attrs = normalizeAttributes(p);
    const identity = norm(`${p.name||''} ${p.short_description||''}`);
    const signals = quickReferenceSignals(p);
    const structured = norm([
      item?.subcategory, p.subcategory, p.subfamily, p.subfamilia,
      p.product_type, p.tipo, p.series, p.serie, p.technology, p.tecnologia,
      p.protocol, p.protocolo, p.environment, p.photo, p.channels, p.connectivity,
      p.wifi, p.lte_4g, p.poe, p.resolution, p.lens, signals,
      ...Object.entries(attrs).flatMap(([key,value]) => [key,value])
    ].filter(Boolean).join(' '));
    const fallback = norm(p.description || '');
    return {
      p, attrs, identity, signals,
      typeText:norm(`${structured} ${identity}`),
      featureText:structured,
      structuredSource:norm(`${structured} ${identity}`),
      fallback,
      source:norm(`${structured} ${identity} ${fallback}`)
    };
  }

  function quickProductRole(item){
    const {p, attrs, typeText} = quickContext(item);
    const name = norm(p.name || '');
    const structured = norm([
      item?.subcategory, p.product_type, p.tipo, p.series,
      ...Object.entries(attrs).flatMap(([key,value]) => [key,value])
    ].filter(Boolean).join(' '));

    const accessory = /(?:^|\b)(bracket|soporte|support|holder|mount|cover|tapa|frame|marco|surfacebox|surface box|faceplate|panel|carcasa|housing|adaptador|adapter|fuente|power supply|psu|alimentacion|alimentación|bypass)(?:\b|$)/.test(`${structured} ${name}`);
    const kit = /(?:^|\b)kit(?:\b|$)/.test(`${structured} ${name}`);
    return {accessory,kit,structured,name};
  }


  function cameraSupportItems(model = buildModel()){
    return model.allItems.filter(item => {
      const p=item?.p || {};
      const ref=clean(p.name).toUpperCase();

      const hierarchy=norm([
        item.category,item.family,item.subcategory,
        p.category,p.family,p.subcategory,p.product_type
      ].filter(Boolean).join(' '));

      const identity=norm([
        p.name,p.short_description,p.product_type
      ].filter(Boolean).join(' '));

      // Exclusiones claras: no mezclar Domótica/Smart Home ni familias ajenas
      // aunque la descripción mencione cámara, vídeo, base o soporte.
      const excludedFamily =
        /\bdomotica\b|\bsmart home\b|\bsmarthome\b|\bautomatizacion\b|\bautomatización\b|\blightswitch\b|\boutletcore\b|\bwaterstop\b/.test(hierarchy);

      if(excludedFamily) return false;

      // Forzados conocidos de CCTV.
      if(ref === 'DS-1280ZJ-XS' || ref === 'DS-1280ZJ-XS-B') return true;

      // Junction boxes reales.
      if(/\bjunction\s*box\b|\bjunctionbox\b|\bcaja de conexiones\b/.test(identity)) return true;

      // Soportes reales: deben estar identificados como accesorio/soporte CCTV
      // en jerarquía o tipo, no solo mencionarlo en una descripción larga.
      const supportIdentity =
        /\bsoporte\b|\bbracket\b|\bmount\b|\bmounting\b|\bbase de camara\b|\bbase cámara\b/.test(identity);

      const cctvHierarchy =
        /\bcctv\b|\bcamara ip\b|\bcámara ip\b|\bvideovigilancia\b|\bsoportes camaras\b|\bsoportes cámaras\b|\baccesorios cctv\b/.test(hierarchy);

      return supportIdentity && cctvHierarchy;
    });
  }

  function detectorHoodItems(model = buildModel()){
    return model.allItems.filter(item => {
      const p=item?.p || {};
      const identity=norm([
        p.name,p.short_description,p.product_type,
        item?.subcategory,p.subcategory,p.family,item?.family
      ].filter(Boolean).join(' '));
      return /\bhood\b|\bhoods\b|\bvisera\b|\bviseras\b|sunshield|rainshield/.test(identity);
    });
  }

  function relatedQuickItems(quickGroup, family = currentFamily(), model = buildModel()){
    const profile=familyQuickProfile(family);
    if(quickGroup === 'Soportes' && profile === 'cameras') return cameraSupportItems(model);
    if(quickGroup === 'Hood / Viseras' && profile === 'detectors') return detectorHoodItems(model);
    return null;
  }

  function isRelatedQuickGroup(quickGroup, family = currentFamily()){
    return Array.isArray(relatedQuickItems(quickGroup,family,buildModel()));
  }

  function sdCapacityLabel(item){
    const p = item?.p || {};
    const attrs = normalizeAttributes(p);
    const text = norm([p.name,p.short_description,p.description,p.capacity,p.storage,p.memory,
      ...Object.entries(attrs).flatMap(([key,value]) => [key,value])].filter(Boolean).join(' '));
    const match = text.match(/(?:^|[^0-9])(\d+(?:[.,]\d+)?)\s*(gb|tb)(?:[^a-z0-9]|$)/i);
    if(!match) return '';
    const n = Number(String(match[1]).replace(',','.'));
    return Number.isFinite(n) ? `${Number.isInteger(n)?n:String(n).replace('.',',')} ${String(match[2]).toUpperCase()}` : '';
  }

  function storageCapacityLabel(item){
    const p = item?.p || {};
    const attrs = normalizeAttributes(p);
    const text = norm([
      p.name, p.short_description, p.description,
      p.capacity, p.storage, p.memory,
      ...Object.entries(attrs).flatMap(([key,value]) => [key,value])
    ].filter(Boolean).join(' '));

    const match = text.match(/(?:^|[^0-9])(\d+(?:[.,]\d+)?)\s*(?:tb|terabytes?)(?:[^a-z0-9]|$)/i);
    if(match){
      const n = Number(String(match[1]).replace(',','.'));
      if(Number.isFinite(n)) return `${Number.isInteger(n) ? n : String(n).replace('.',',')} TB`;
    }

    const compact = norm(p.name || '').replace(/[^a-z0-9]/g,'');
    const ref = compact.match(/(\d+(?:[.,]\d+)?)tb/);
    if(ref){
      const n = Number(String(ref[1]).replace(',','.'));
      if(Number.isFinite(n)) return `${Number.isInteger(n) ? n : String(n).replace('.',',')} TB`;
    }
    return '';
  }

  function quickGroupsForItem(item, family){
    const profile = familyQuickProfile(family);
    if(!profile) return [];

    const {p, attrs, identity, typeText, featureText, source} = quickContext(item);
    const tags = new Set();
    const add = label => tags.add(label);

    if(profile === 'cameras'){
      if(/\bptz\b/.test(typeText)) add('PTZ');
      if(/\bcube\b|\bcubo\b/.test(typeText)) add('Cube');
      if(/\bturret\b/.test(typeText)) add('Turret');
      if(/\bbullet\b/.test(typeText)) add('Bullet');
      if(/\bdome\b|\bdomo\b/.test(typeText)) add('Domo');
    }

    if(profile === 'infrared_barriers'){
      const pBarrier = item?.p || {};
      const attrsBarrier = normalizeAttributes(pBarrier);
      const hierarchyBarrier = norm([
        item?.category, item?.family, item?.subcategory,
        pBarrier.category, pBarrier.family, pBarrier.subcategory,
        pBarrier.product_type, pBarrier.tipo, pBarrier.technology, pBarrier.tecnologia,
        ...Object.entries(attrsBarrier).flatMap(([key,value]) => [key,value])
      ].filter(Boolean).join(' '));
      const sourceBarrier = norm([
        pBarrier.name, pBarrier.short_description, pBarrier.description,
        hierarchyBarrier
      ].filter(Boolean).join(' '));

      // El tipo de comunicación es excluyente:
      // Híbrida > Inalámbrica > Cableada.
      const hybridBarrier =
        /cablead[ao]\s+(?:e|y)\s+inalambric[ao]|wired\s+(?:and|&)\s+wireless|\bhybrid\b|\bhibrid[ao]\b/.test(sourceBarrier);

      const wirelessBarrier =
        !hybridBarrier && (
          /ajax\s+inalambric[ao]|\binalambric[ao]\b|\bwireless\b|\bradio\b/.test(hierarchyBarrier)
          || /barrera[^.]{0,60}(?:inalambric[ao]|wireless)/.test(sourceBarrier)
        );

      const wiredBarrier =
        !hybridBarrier && !wirelessBarrier && (
          /\bcablead[ao]\b|\bwired\b|salida de rele|salida de rel[eé]|relay output/.test(hierarchyBarrier)
          || /barrera[^.]{0,60}(?:cablead[ao]|wired)/.test(sourceBarrier)
        );

      // Compatibilidad no equivale a Apertura: DoorProtect/Transmitter solo
      // activa este atajo de integración Ajax.
      const ajaxCompatible =
        /ajax\s+inalambric[ao]|compatible[^.]{0,80}\bajax\b|integracion[^.]{0,80}\bajax\b|integración[^.]{0,80}\bajax\b/.test(sourceBarrier)
        || /(?:^|[\s_-])transmitter(?:[\s_-]|$)|\bdoor\s*protect\b|(?:^|[\s_-])doorprotect(?:[\s_-]|$)/.test(sourceBarrier);

      const solarBarrier =
        /\bsolar\b|panel solar|alimentacion solar|alimentación solar|solar powered|photovoltaic|fotovoltaic[ao]/.test(sourceBarrier);

      if(wiredBarrier) add('Cableadas');
      if(wirelessBarrier) add('Inalámbricas');
      if(hybridBarrier) add('Híbridas');
      if(ajaxCompatible) add('Compatible Ajax');
      if(solarBarrier) add('Solares');
    }

    if(profile === 'detectors'){
      const role = quickProductRole(item);
      const {structuredSource, fallback} = quickContext(item);
      const matches = (rx, fallbackRx = rx) =>
        rx.test(structuredSource) || (!role.accessory && fallbackRx.test(fallback));

      const curtain = matches(/doublecurtain|curtainprotect|curtain cam|curtaincam|\bcurtain\b|\bcortina\b/);
      const flood = matches(/leakprotect|leaksprotect|water leak|flood detector|detector(?:\s+de)?\s+inundaci[oó]n|\binundaci[oó]n\b/);
      const firePattern = /fireprotect|smoke detector|heat detector|carbon monoxide|detector(?:\s+de)?\s+(?:humo|incendio|calor|co)/;
      const fire = !role.accessory && !curtain && !flood && firePattern.test(structuredSource);
      // APERTURA: clasificación positiva por función real.
      // No usa la descripción larga como señal: un PIR/exterior puede mencionar
      // "apertura de carcasa" o tamper sin ser un contacto de apertura.
      const pDoor = item?.p || {};
      const attrsDoor = normalizeAttributes(pDoor);
      const refDoor = norm(pDoor.name || '');
      const shortDoor = norm(pDoor.short_description || '');
      const structuredDoor = norm([
        item?.subcategory, pDoor.subcategory, pDoor.subfamily, pDoor.subfamilia,
        pDoor.product_type, pDoor.tipo, pDoor.series, pDoor.serie,
        ...Object.entries(attrsDoor)
          .filter(([key]) => /tipo|type|categoria|category|subcategoria|subcategory|sensor|detector|contact/.test(norm(key)))
          .flatMap(([key,value]) => [key,value])
      ].filter(Boolean).join(' '));

      const doorRoleSource = norm(`${refDoor} ${shortDoor} ${structuredDoor}`);
      // DoorProtect debe ser un token real. "OutdoorProtect" contiene
      // la cadena "doorprotect", pero NO es un contacto de apertura.
      const isDoorProtect =
        /(?:^|[\s_-])doorprotect(?:[\s_-]|$)|\bdoor\s+protect\b/.test(doorRoleSource);

      const isMagneticContact =
        /magnetic contact|contacto magn[eé]tico|reed contact|reed switch/.test(doorRoleSource);

      const isOpeningDetector =
        /detector(?:\s+de)?\s+apertura/.test(doorRoleSource)
        && /\bpuerta\b|\bventana\b|\bdoor\b|\bwindow\b/.test(doorRoleSource);
      const isTamperOnly =
        /tamper|antisabotaje|anti sabotaje|apertura(?:\s+de)?\s+(?:carcasa|tapa|cuerpo|housing|cover)/.test(doorRoleSource)
        && !isDoorProtect && !isMagneticContact;

      const door = !role.accessory && !isTamperOnly
        && (isDoorProtect || isMagneticContact || isOpeningDetector);
      const glass = matches(/glassprotect|glass protect|glass break|rotura(?:\s+de)?\s+cristal/);
      const combi = matches(/combiprotect|combi protect/);
      const motioncam = matches(/motioncam|motion cam|curtaincam|curtain cam|detector de movimiento con imagen|fotodetector.*imagen/);
      const phod = matches(/\bphod\b|photo on demand|foto bajo demanda/);
      const outdoor = matches(/\boutdoor\b|\bexterior\b/);
      const motion = matches(/motionprotect|motion protect|\bpir\b|detector(?:\s+de)?\s+movimiento|fotodetector/);

      if(motion) add('Movimiento / PIR');
      if(door && !fire) add('Apertura');
      if(flood && !fire) add('Inundación');
      if(motioncam) add('MotionCam');
      if(phod && motioncam) add('PhOD');
      if(glass && !fire) add('Cristal');
      if(combi){ add('Combi'); add('Movimiento / PIR'); add('Cristal'); }
      if(outdoor && !fire) add('Exterior');
      if(curtain && !fire) add('Cortina');
      if(fire) add('Incendio');
    }

    if(profile === 'smart_home'){
      const pSmart=item?.p || {};
      const refSmart=norm(pSmart.name || '');
      const refCompactSmart=refSmart.replace(/[^a-z0-9]/g,'');
      const identitySmart=norm([
        pSmart.name,pSmart.short_description,pSmart.product_type,pSmart.tipo,
        item?.subcategory,pSmart.subcategory,pSmart.family
      ].filter(Boolean).join(' '));

      // Componentes Ajax: la referencia manda.
      // CENTER/SIDE/SOLOCOVER son tapas de Outlet, nunca Frames.
      // CENTER/SIDE/SOLOBUTTON son teclas/tapas de LightSwitch.
      const isFrame =
        /(?:^|[-_\s])frame(?:[-_\s]|$)/.test(refSmart)
        || /^ajframe\d*/.test(refCompactSmart);

      const isSurfaceBox =
        /surfacebox/.test(refCompactSmart)
        || /surface\s*box|caja(?: de)? superficie|caja superficial/.test(identitySmart);

      const isSwitchCover =
        /(?:center|side|solo)button/.test(refCompactSmart)
        || /panel tactil para un interruptor de luz|panel táctil para un interruptor de luz/.test(identitySmart);

      const isOutletCover =
        /(?:center|side|solo)cover/.test(refCompactSmart)
        || /coverplate/.test(refCompactSmart)
        || /tapa(?: de| para)? enchufe|cubierta(?: de| para)? enchufe/.test(identitySmart);

      const smartAccessory = isFrame || isSurfaceBox || isSwitchCover || isOutletCover;

      if(isFrame) add('Frames');
      if(isSurfaceBox) add('Cajas superficie');
      if(isSwitchCover) add('Tapas interruptor');
      if(isOutletCover) add('Tapas enchufe');

      if(!smartAccessory){
        const isRelay =
          /wallswitch|wall switch|\brelay\b|aj-relay|rel[eé]\s+(?:contacto|tension|tensión)|\brel[eé]s?\b/.test(identitySmart);

        const isOutlet =
          /outletcore|outlet core|socket|enchufe(?: ethernet| inteligente)?|\boutlet\b/.test(identitySmart);

        const isSwitch =
          /lightswitch|light switch|lightcore|light core|interruptor inteligente/.test(identitySmart);

        if(/doorbell|timbre|videoportero/.test(identitySmart)) add('Timbre / Doorbell');
        if((isSwitch || isRelay) && !isOutlet) add('Interruptores');
        if(isOutlet) add('Enchufes');
        if(/waterstop|electrov[aá]lvula|\bvalve\b/.test(identitySmart)) add('Válvulas');
        if(/lifequality|monitor.*(?:temperatura|humedad|co2)|calidad.*aire/.test(identitySmart)) add('Clima / Aire / LifeQuality');
      }
    }

    if(profile === 'nvr'){
      let channelNumber = 0;
      const channelText = norm(`${p.channels||''} ${featureText}`);
      const explicitChannel = channelText.match(/(?:^|\D)(4|8|16|32|64)\s*(?:ch|canales?|channels?)(?:\D|$)/);
      if(explicitChannel) channelNumber = Number(explicitChannel[1]);

      if(!channelNumber){
        const channelAttr = Object.entries(attrs).find(([key]) => /canal|channel|numero.*canal|number.*channel/.test(norm(key)));
        const match = channelAttr ? norm(channelAttr[1]).match(/\b(4|8|16|32|64)\b/) : null;
        if(match) channelNumber = Number(match[1]);
      }

      if(!channelNumber){
        const model = norm(p.name || '').replace(/[^a-z0-9]/g,'');
        const match = model.match(/nvr\d*?(04|08|16|32|64)(?:[a-z]|$)/);
        if(match) channelNumber = Number(match[1]);
      }

      if(channelNumber) add(channelNumber >= 32 ? '32+ canales' : `${channelNumber} canales`);
      const hdmi = Object.entries(attrs).some(([key,value]) => {
        const k = norm(key), v = norm(value);
        return (/hdmi/.test(k) && !/^(?:no|0|false|sin|n\/a)$/.test(v))
          || (/salida|video|conector|interface|interfaz/.test(k) && /\bhdmi\b/.test(v));
      });
      const nvrModel = clean(p.name || '').toUpperCase();
      const hdmiModel = /(?:^|[-_])NVR\d+(?:[-_])H[A-Z0-9]*/.test(nvrModel)
        || /AJ-NVR\d+-H[A-Z0-9]*/.test(nvrModel);
      if(hdmi || hdmiModel || /\bhdmi\b/.test(featureText)) add('HDMI');
    }

    if(profile === 'centrals'){
      const {structuredSource} = quickContext(item);
      const src = structuredSource;
      const secondary = /modulo|módulo|alimentacion|alimentación|power supply|fuente|bracket|soporte|tapa|cover/.test(src);
      const repeater = !secondary && /(?:^|\s)(rex\s*2|rex2|rex)(?:\s|$)|\brepetidor\b|\brepeater\b/.test(src);
      const hubPlus = /hub\s*2\s*plus|hub2plus|hub plus|hubplus/.test(src);

      const hubBp = /\bhubbp\b/.test(src);
      if(hubBp) add('HUBBP');
      else if(/\bhub\s*2\b|\bhub2\b/.test(src)) add('Hub 2');
      else if(/\bhub\b/.test(src) && !/\bhubkit\b/.test(src)) add('Hub');
      if(/\b4g\b|\blte\b/.test(src)) add('4G / LTE');
      if(/\bwi[ -]?fi\b|\bwlan\b/.test(src) || hubPlus) add('Wi‑Fi');
      if(hubPlus) add('Hub Plus');
      if(/\bhybrid\b/.test(src)) add('Hybrid');
      if(repeater) add('Repetidores');
    }

    if(profile === 'sd_storage'){
      const capacity = sdCapacityLabel(item);
      if(capacity) add(capacity);
    }

    if(profile === 'storage'){
      const capacity = storageCapacityLabel(item);
      if(capacity) add(capacity);
    }

    if(profile === 'spares'){
      const {source} = quickContext(item);
      const src = source;
      if(/\bbracket\b|\bbrackets\b|\bsoporte\b|\bmount\b/.test(src)) add('Brackets');
      if(/carcasa|housing|enclosure|\bcover\b|\btapa\b|\bcuerpo\b/.test(src)) add('Carcasas');
      if(/bateria|batería|battery|batterykit|battery kit|\bbatt\b|\bpila\b/.test(src)) add('Baterías');
      const refSpare = norm(item?.p?.name || '');
      if(/\bpcb\b|printed circuit|placa electronica|placa electrónica|circuit board/.test(src)
        || /pcb\d*|[-_]pcb(?:[-_]|$)/.test(refSpare)) add('PCB');
      if(/\blente\b|\blentes\b|\blens\b|\blenses\b|optica|óptica/.test(src)) add('Lentes');

    }

    if(profile === 'ups'){
      const {source} = quickContext(item);
      if(/\bups\b|\bsai\b|alimentacion ininterrumpida|alimentación ininterrumpida/.test(source)) add('UPS');
    }

    if(profile === 'routers_mobile'){
      const pRouter = item?.p || {};
      const {source} = quickContext(item);
      const textRouter = norm(`${pRouter.name||''} ${pRouter.short_description||''} ${pRouter.description||''} ${source}`);
      if(/\bindustrial\b/.test(textRouter)) add('Industrial');
      const isLicense = /licencia|license|licence|suscripcion|suscripción|subscription/.test(textRouter);
      if(isLicense) add('Licencias');
      else add('Routers');
    }

    if(profile === 'unmanaged_switches'){
      const pSwitch = item?.p || {};
      const attrsSwitch = normalizeAttributes(pSwitch);
      const textSwitch = norm([
        pSwitch.name,pSwitch.short_description,pSwitch.description,
        pSwitch.ports,pSwitch.puertos,pSwitch.poe,
        ...Object.entries(attrsSwitch).flatMap(([k,v])=>[k,v])
      ].filter(Boolean).join(' '));

      let ports = 0;
      const explicitPorts = textSwitch.match(/(?:^|\D)(4|5|8|16|24|48)\s*(?:puertos?|ports?)(?:\D|$)/);
      if(explicitPorts) ports = Number(explicitPorts[1]);

      if(!ports){
        const refCompact = norm(pSwitch.name||'').replace(/[^a-z0-9]/g,'');
        const refPorts = refCompact.match(/(?:switch|sw)[a-z]*?(04|05|08|16|24|48)(?:[a-z]|$)/);
        if(refPorts) ports = Number(refPorts[1]);
      }

      if([4,5,8,16,24,48].includes(ports)) add(`${ports} puertos`);

      const poe = /\bpoe\b|poe\+|802\.3af|802\.3at|802\.3bt/.test(textSwitch);
      if(poe) add('PoE');
    }

    if(profile === 'power_supply'){
      const pPower = item?.p || {};
      const {source} = quickContext(item);
      const hierarchy = norm([
        pPower.category, pPower.family, pPower.subcategory, pPower.product_type,
        item?.category, item?.family, item?.subcategory
      ].filter(Boolean).join(' '));
      const dinText = norm(`${pPower.name||''} ${pPower.short_description||''} ${pPower.description||''} ${hierarchy} ${source}`);
      if(/\b(?:formato\s+din|carril\s+din|din\s+rail|din)\b/.test(dinText)) add('Formato DIN');
      const compact = norm(pPower.name || '').replace(/[^a-z0-9]/g,'');
      const excludedPack = /batterybox|batterykit|batterypack|batteryholder|batterycase|powerbank|acumulador|accumulator|modulobateria|batterymodule/.test(compact);
      const pile = /baterias? y pilas|batteries and cells/.test(hierarchy)
        && !excludedPack
        && (/pila|pilas|battery cell|coin cell|button cell/.test(source)
          || /battcr|cr\d{3,4}[a-z]?|lr\d+[a-z]?|er\d+[a-z]?|batt(?:aa|aaa|aaaa|9v)/.test(compact));
      // Los atajos de Alimentación son excluyentes por rama/función.
      // Una pila puede mencionar "alimentación" en su descripción, pero nunca debe
      // aparecer como Fuente y Alimentador.
      const supplyBranch = /fuentes? y alimentadores|power supplies/.test(hierarchy);
      const supplyType = /fuente(?:\s+de)?\s+alimentacion|alimentador|power supply|ac adapter|adaptador de corriente/.test(source);
      const supply = !pile && (supplyBranch || supplyType);

      const poeInjector = !pile && /poe/.test(hierarchy)
        && /inyector poe|poe injector|injector poe/.test(source);

      if(pile) add('Pilas');
      else if(poeInjector) add('Inyectores PoE');
      else if(supply) add('Fuentes y Alimentadores');
    }

    if(profile === 'wireless_accessories'){
      const role = quickProductRole(item);
      const {structuredSource} = quickContext(item);
      const src = structuredSource;
      const isIntegrationModule = /\btransmitter\b|\bmultitransmitter\b|\bvhfbridge\b|\buartbridge\b|\bocbridge\b|\btransmisor\b|modulo de integracion|módulo de integración/.test(src);
      if(isIntegrationModule) add('Transmitters');
      if(/\bhood\b|\bhoods\b|\bvisera\b|\bviseras\b|sunshield|rainshield/.test(src)) add('Hood / Viseras');
      if(/\bholder\b|\bholders\b|\bdinholder\b|\bdin holder\b|\bsoporte holder\b/.test(src)) add('Holder');
      if(/\baj[-_ ]?sim\b|\bsim\b|\bm2m\b|\blxm2m[-_ ]?card[-_ ]?es\b/.test(src)) add('SIM');
      // Clasificación por IDENTIDAD del producto, no por textos de
      // compatibilidad. Ej.: AJ-PASS menciona "Compatible con KeyPad",
      // pero sigue siendo una tarjeta de acceso, no un teclado.
      const pWireless = item?.p || {};
      const refWireless = norm(pWireless.name || '');
      const roleWireless = norm([
        item?.subcategory,
        pWireless.subcategory,
        pWireless.product_type,
        pWireless.tipo,
        pWireless.family
      ].filter(Boolean).join(' '));

      const isActualKeypad =
        /(?:^|[-_\s])keypad(?:plus|combi|outdoor|touchscreen)?(?:[-_\s]|$)/.test(refWireless)
        || /\bteclado\b|\bkeypad\b/.test(roleWireless);

      const isSimProduct =
        /(?:^|[-_\s])sim(?:[-_\s]|$)|\bm2m\b/.test(refWireless)
        || /\bsim\b|\bm2m\b|tarjeta sim|sim card/.test(roleWireless);

      const tagCardByName =
        /(?:^|[-_\s])(tag|tags|card|cards|pass)(?:[-_\s]|$)/.test(refWireless);

      const tagCardByRole =
        /tarjeta(?: de acceso| de proximidad)?|llavero(?: de proximidad)?|\btag\b|\bcard\b|\bpass\b|rfid card|nfc card/.test(roleWireless);

      const isTagCard =
        !isActualKeypad
        && !isSimProduct
        && (tagCardByName || tagCardByRole);

      if(isTagCard) add('Tags / Cards');

      if(!role.accessory){
        if(isActualKeypad) add('Teclados');
        const isSirenAccessory = /brandplate|brand plate|placa de marca|logo plate|embellecedor/.test(src);
        if(!isSirenAccessory && /homesiren|streetsiren|\bsiren\b|\bsirena\b/.test(src)) add('Sirenas');
        if(!isIntegrationModule && /\brelay\b|wallswitch|\brel[eé]\b/.test(src)) add('Relés');
        if(!isActualKeypad && !isTagCard && /spacecontrol|doublebutton|(?:^|\s)button(?:\s|$)|\bmando\b|bot[oó]n/.test(src)) add('Botones / Mandos');
        if(/\bsocket\b|\benchufe\b/.test(src)) add('Enchufes');
        if(/waterstop|\bvalve\b|\bv[aá]lvula\b/.test(src)) add('Válvulas');
        if(/(?:^|\s)(rex\s*2|rex2|rex)(?:\s|$)|\brepetidor\b|\brepeater\b/.test(src)) add('Repetidores');
        if(/lifequality|life quality/.test(src)) add('LifeQuality');
      }
    }

    if(profile === 'racks_wall'){
      add('Racks');
    }

    return [...tags];
  }

  function quickAvailability(family = currentFamily(), model = buildModel()){
    const profile = familyQuickProfile(family);
    if(!profile || !family) return [];

    if(profile === 'sd_storage'){
      const capacities = new Set();
      family.items.forEach(item => {
        const label = sdCapacityLabel(item);
        if(label) capacities.add(label);
      });
      return [...capacities].sort((a,b) => (parseFloat(a)||0) - (parseFloat(b)||0));
    }

    if(profile === 'storage'){
      const capacities = new Set();
      family.items.forEach(item => {
        const label = storageCapacityLabel(item);
        if(label) capacities.add(label);
      });
      return [...capacities].sort((a,b) => (parseFloat(a)||0) - (parseFloat(b)||0));
    }

    const order = QUICK_FILTER_ORDER[profile] || [];
    if(!order.length) return [];

    const available = new Set();
    family.items.forEach(item => {
      quickGroupsForItem(item, family).forEach(label => available.add(label));
    });

    if(profile === 'cameras' && cameraSupportItems(model).length) available.add('Soportes');
    if(profile === 'detectors' && detectorHoodItems(model).length) available.add('Hood / Viseras');
    return order.filter(label => available.has(label));
  }

  function quickGroups(baseItems, familyOverride = null){
    const family = familyOverride || currentFamily();
    const profile = familyQuickProfile(family);
    if(!profile || !family) return [];

    const model = buildModel();
    const available = quickAvailability(family, model);
    const counts = new Map(available.map(label => [label, 0]));

    // Contextual counts from current query/advanced filters.
    baseItems.forEach(item => {
      quickGroupsForItem(item, family).forEach(label => {
        if(counts.has(label)) counts.set(label, counts.get(label) + 1);
      });
    });

    available.forEach(label => {
      const related=relatedQuickItems(label,family,model);
      if(!Array.isArray(related)) return;
      let relatedItems=related.slice();
      if(clean(state.query)) relatedItems=rankedSearch(relatedItems,state.query);
      relatedItems=applyFilters(relatedItems,state.filters);
      counts.set(label,relatedItems.length);
    });

    return available.map(label => ({label, count:counts.get(label) || 0}));
  }

  function quickTypes(baseItems){
    const groups = quickGroups(baseItems);
    if(!groups.length) return '';

    return `<div class="hxp-type-scroll-shell" data-hxp-quick-scroll>
      <button type="button" class="hxp-type-scroll hxp-type-scroll-left" data-hxp-quick-left aria-label="Ver atajos anteriores">‹</button>
      <div class="hxp-type-strip" aria-label="Filtros rápidos">
        <button type="button" class="hxp-type-tab ${!state.quickGroup?'is-active':''}" data-hxp-quick="">Todos</button>
        ${groups.map(group => {
          const active = state.quickGroup === group.label;
          const disabled = group.count === 0 && !active;
          return `<button type="button"
            class="hxp-type-tab ${active?'is-active':''} ${disabled?'is-disabled':''}"
            data-hxp-quick="${esc(group.label)}"
            ${disabled?'disabled aria-disabled="true"':''}>
            <span>${esc(group.label)}</span><em>${group.count}</em>
          </button>`;
        }).join('')}
      </div>
      <button type="button" class="hxp-type-scroll hxp-type-scroll-right" data-hxp-quick-right aria-label="Ver más atajos">›</button>
    </div>`;
  }

  function stockBadge(product){
    let status = { visible:false, clase:'', texto:'' };
    try{ status = typeof hxEstadoStock === 'function' ? hxEstadoStock(product?.stock) : status; }catch(_error){}
    if(!status.visible) return '<span class="hxp-stock is-unknown"><i></i>Stock sin indicar</span>';
    const text = status.clase === 'is-ok' ? 'Disponible' : status.clase === 'is-none' ? 'Sin stock' : 'Stock limitado';
    return `<span class="hxp-stock ${esc(status.clase)}" title="${esc(status.texto || text)}"><i></i>${esc(text)}</span>`;
  }

  function productMeta(product){
    const values = [
      technologyFacet(product) || getByAliases(product,['protocol','protocolo']),
      colorFacet(product)
    ].filter(Boolean);
    return [...new Set(values)].slice(0,2).map(value => `<span>${esc(value)}</span>`).join('');
  }

  function productImage(product){
    const image = clean(product?.image);
    if(!image) return `<div class="hxp-thumb hxp-thumb-empty" aria-hidden="true">${svgIcon('box')}</div>`;
    return `<button type="button" class="hxp-thumb hx-product-thumb" data-image="${esc(image)}" aria-label="Ampliar imagen de ${esc(product?.name)}">
      <img src="${esc(image)}" alt="" loading="lazy" onerror="this.closest('.hxp-thumb').classList.add('hxp-thumb-error')">
      <span class="hxp-thumb-fallback">${svgIcon('box')}</span>
    </button>`;
  }

  function productCard(item){
    const product = item.p || {};
    const price = Number(product.pvp) || 0;
    const description = safeDescription(product) || 'Sin descripción disponible';
    const fullDescription = longDescription(product);
    const priceText = typeof fmt?.format === 'function' ? fmt.format(price) : `${price.toFixed(2)} €`;
    const isNew = hxIsNewProduct(product);
    const newBadge = isNew ? '<span class="hxp-new-badge">NUEVO</span>' : '';
    const newClass = isNew ? `<span class="hxp-new-class">${esc(item.category)} → ${esc(item.family)}${item.subcategory?` · ${esc(item.subcategory)}`:''}</span>` : '';
    return `<article class="hxp-product${isNew?' is-new-product':''}" data-index="${item.index}" data-ref="${esc(product.name)}" data-pvp="${price}">
      ${newBadge}
      <div class="hxp-product-main">
        ${productImage(product)}
        <div class="hxp-product-copy">
          <div class="hxp-product-refline"><strong class="hxp-product-ref">${esc(product.name || 'Sin referencia')}</strong>${fullDescription ? `<span class="hxp-description-toggle hxp-detail-ref" role="button" tabindex="0" data-hxp-description-toggle aria-expanded="false" aria-label="Ver detalle"><span class="hxp-detail-icon" aria-hidden="true">⌄</span></span>` : ''}</div>
          <span class="hxp-product-description">${esc(description)}</span>
          ${fullDescription ? `<div class="hxp-product-long-description">${esc(fullDescription)}</div>` : ''}
          ${newClass}
          <div class="hxp-product-meta">${stockBadge(product)}${productMeta(product)}</div>
        </div>
      </div>
      <div class="hxp-product-commerce">
        <b class="hxp-price">${esc(priceText)}</b>
        <div class="hxp-product-actions hxp-product-actions-with-compat">
          ${typeof hxQtyControlHtml === 'function' ? hxQtyControlHtml('explorer', item.index) : ''}
          <button type="button" class="hxp-add" data-hxp-add="${item.index}">Añadir</button>
        </div>
      </div>
    </article>`;
  }

  function quickCounterItems(){
    const model = buildModel();
    let items = state.familyKey ? familyItems(model) : model.allItems.slice();
    if(clean(state.query)) items = rankedSearch(items, state.query);
    return applyFilters(items, state.filters);
  }

  function desktopFamilyRail(model = buildModel()){
    if(isMobile() || !state.familyKey) return '';
    const families = model.families;
    return `<aside class="hxp-family-rail" aria-label="Familias">
      <div class="hxp-family-rail-head"><strong>Familias</strong></div>
      <div class="hxp-family-rail-list">
        ${families.map(family => `<button type="button" class="hxp-family-rail-item ${family.key===state.familyKey?'is-active':''}" data-hxp-family="${esc(family.key)}">
          <span>${esc(visibleFamilyTitle(family))}</span><em>${family.count}</em>
        </button>`).join('')}
      </div>
    </aside>`;
  }

  function productsView(){
    const model = buildModel();
    const family = currentFamily(model);
    if(family && state.quickGroup && !quickAvailability(family, model).includes(state.quickGroup)){
      state.quickGroup = '';
    }
    const baseItems = family ? family.items.slice() : model.allItems.slice();
    const items = resultItems();
    const title = family?.familyTitle || 'Resultados';
    const context = family?.context || (state.query ? 'Búsqueda en todo el catálogo' : 'Todos los productos');
    return `${toolbar(items.length)}
      <div class="hxp-products-layout ${state.familyKey ? 'has-family-rail' : 'is-global-results'}">
        ${desktopFamilyRail(model)}
        <main class="hxp-main hxp-products-view">
        ${mobileCompactBar(items.length, family)}
        <div class="hxp-current-family">
          <button type="button" class="hxp-back" data-hxp-home aria-label="Volver a familias">${svgIcon('back')}</button>
          <div><h3>${esc(title)}</h3><p>${esc(context)}</p></div>
          ${state.familyKey ? `<button type="button" class="hxp-change-family" data-hxp-home>Cambiar familia</button>` : ''}
        </div>
        ${state.familyKey ? quickTypes(quickCounterItems()) : ''}
        <div class="hxp-products-scroll" id="hxpProductsScroll">
          ${items.map(productCard).join('') || `<div class="hxp-empty hxp-empty-products"><strong>No hay productos con estos filtros.</strong><button type="button" data-hxp-clear-filters>Limpiar todo</button></div>`}
        </div>
      </main>
      </div>`;
  }

  function selectedFilterSummary(filters, quickGroup = state.quickGroup){
    const count = activeFilterCount(filters);
    const parts = [];
    if(quickGroup) parts.push(`Rápido: ${quickGroup}`);
    if(count) parts.push(`${count} filtro${count===1?'':'s'} activo${count===1?'':'s'}`);
    return parts.length ? parts.join(' · ') : 'Sin filtros activos';
  }

  function drawerHtml(){
    if(!state.drawerOpen) return '';
    const definitionBase = definitionItemsForQuick(drawerQuickDraft);
    const facets = buildContextualFacets(definitionBase, drawerDraft, drawerQuickDraft);
    const previewCount = resultItems(drawerDraft, drawerQuickDraft).length;
    const groups = facets.map((group,index) => {
      const selected = drawerDraft[group.key] || [];
      const defaultOpen = selected.length || (isMobile() ? index < 2 : index < 4);
      return `<details class="hxp-filter-group" ${defaultOpen ? 'open' : ''}>
        <summary><span>${esc(group.label)}</span><em>${selected.length || group.values.length}</em></summary>
        <div class="hxp-filter-options">
          ${group.values.map(value => {
            const checked = selected.includes(value.id);
            const disabled = value.count === 0 && !checked;
            return `<label class="hxp-filter-option ${disabled?'is-disabled':''}">
              <input type="checkbox" data-hxp-facet="${esc(group.key)}" value="${esc(value.id)}" ${checked?'checked':''} ${disabled?'disabled':''}>
              <span>${esc(value.title)}</span><em>${value.count}</em>
            </label>`;
          }).join('')}
        </div>
      </details>`;
    }).join('');

    return `<div class="hxp-drawer-layer" data-hxp-drawer-layer>
      <button type="button" class="hxp-drawer-backdrop" data-hxp-close-filters aria-label="Cerrar filtros"></button>
      <aside class="hxp-drawer" role="dialog" aria-modal="true" aria-labelledby="hxpFiltersTitle">
        <header class="hxp-drawer-head">
          <div><h3 id="hxpFiltersTitle">Filtros</h3><p id="hxpFilterSummary">${esc(selectedFilterSummary(drawerDraft, drawerQuickDraft))}</p></div>
          <button type="button" class="hxp-drawer-close" data-hxp-close-filters aria-label="Cerrar filtros">${svgIcon('close')}</button>
        </header>
        <div class="hxp-drawer-body">${groups || '<div class="hxp-empty">No hay filtros adicionales para esta selección.</div>'}</div>
        <footer class="hxp-drawer-foot">
          <button type="button" class="hxp-filter-clear" data-hxp-draft-clear>Limpiar todo</button>
          <button type="button" class="hxp-filter-apply" data-hxp-apply>Ver ${previewCount} producto${previewCount===1?'':'s'}</button>
        </footer>
      </aside>
    </div>`;
  }

  function budgetSummaryData(){
    try{
      const rows=Array.isArray(window.lineas) ? window.lineas : (typeof lineas !== 'undefined' && Array.isArray(lineas) ? lineas : []);
      const productRows=rows.filter(row => row && !row.separador && (clean(row.name) || Number(row.pvp)));
      const units=productRows.reduce((sum,row)=>sum+Math.max(1,Number(row.qty)||1),0);
      const total=productRows.reduce((sum,row)=>{
        const qty=Math.max(1,Number(row.qty)||1);
        const pvp=Number(row.pvp)||0;
        const dto=Math.max(0,Math.min(100,Number(row.dto)||0));
        return sum+(pvp*qty*(1-dto/100));
      },0);
      return {rows:productRows,units,total};
    }catch(_error){ return {rows:[],units:0,total:0}; }
  }

  function budgetSummaryHtml(){
    const data=budgetSummaryData();
    if(!data.rows.length) return '';
    const totalText=typeof fmt?.format === 'function' ? fmt.format(data.total) : `${data.total.toFixed(2)} €`;
    const recent=data.rows.slice(-5).reverse();

    if(budgetSummaryMinimized){
      return `<div class="hxp-budget-summary is-minimized" data-hxp-budget-summary>
        <button type="button" class="hxp-budget-mini" data-hxp-budget-restore aria-label="Restaurar resumen del presupuesto" title="Restaurar resumen">
          <span class="hxp-budget-cart" aria-hidden="true">${svgIcon('box')}</span>
          <b>${data.units}</b>
        </button>
      </div>`;
    }

    return `<div class="hxp-budget-summary" data-hxp-budget-summary>
      <div class="hxp-budget-dock">
        <button type="button" class="hxp-budget-pill" data-hxp-budget-toggle aria-expanded="false" aria-label="Abrir resumen del presupuesto">
          <span class="hxp-budget-cart" aria-hidden="true">${svgIcon('box')}</span>
          <span class="hxp-budget-pill-copy">
            <strong>${data.rows.length} línea${data.rows.length===1?'':'s'} · ${data.units} ud${data.units===1?'':'s'}</strong>
            <small>${esc(totalText)}</small>
          </span>
        </button>
        <button type="button" class="hxp-budget-dismiss" data-hxp-budget-dismiss aria-label="Ocultar resumen">×</button>
      </div>

      <div class="hxp-budget-popover" data-hxp-budget-popover hidden>
        <div class="hxp-budget-popover-head">
          <div>
            <small>Presupuesto actual</small>
            <strong>${data.rows.length} línea${data.rows.length===1?'':'s'} · ${data.units} ud${data.units===1?'':'s'}</strong>
          </div>
          <b>${esc(totalText)}</b>
        </div>

        <div class="hxp-budget-lines">
          ${recent.map(row=>{
            const qty=Math.max(1,Number(row.qty)||1);
            const pvp=Number(row.pvp)||0;
            const dto=Math.max(0,Math.min(100,Number(row.dto)||0));
            const rowTotal=pvp*qty*(1-dto/100);
            const rowTotalText=typeof fmt?.format === 'function' ? fmt.format(rowTotal) : `${rowTotal.toFixed(2)} €`;
            return `<div class="hxp-budget-line">
              <span><b>${qty}×</b> ${esc(row.name||'Producto')}</span>
              <em>${esc(rowTotalText)}</em>
            </div>`;
          }).join('')}
        </div>

        ${data.rows.length>5?`<small class="hxp-budget-more">+${data.rows.length-5} líneas más en el presupuesto</small>`:''}

        <button type="button" class="hxp-budget-go" data-hxp-budget-go>
          <span>Ver presupuesto</span><span aria-hidden="true">→</span>
        </button>
      </div>
    </div>`;
  }

  function refreshBudgetSummary(){
    const root=byId('familiasGrid');
    if(!root) return;
    const current=root.querySelector('[data-hxp-budget-summary]');
    const html=budgetSummaryHtml();
    if(!html){ current?.remove(); return; }
    const app=root.querySelector('.hxp-app');
    if(!app) return;
    if(current) current.outerHTML=html;
    else app.insertAdjacentHTML('beforeend',html);
    bindBudgetSummary(root);
  }



  window.addEventListener('hxa:product-added',event=>{
    try{
      const detail=event?.detail||{};
      const root=byId('familiasGrid');
      if(!root) return;
      let toast=root.querySelector('[data-hxp-added-toast]');
      if(!toast){
        toast=document.createElement('div');
        toast.className='hxp-added-toast';
        toast.setAttribute('data-hxp-added-toast','');
        root.appendChild(toast);
      }
      const qty=Math.max(1,Number(detail.quantity)||1);
      toast.textContent=`✓ ${qty}× ${detail.name||'Producto'} añadido al presupuesto`;
      toast.classList.add('is-visible');
      clearTimeout(window.__hxpAddedToastTimer);
      window.__hxpAddedToastTimer=setTimeout(()=>toast.classList.remove('is-visible'),1800);
    }catch(_error){}
  });

  window.addEventListener('hxa:budget-updated',()=>{
    try{
      budgetSummaryMinimized=false;
      refreshBudgetSummary();
    }catch(_error){}
  });

  function bindBudgetSummary(root){
    const restore=root?.querySelector('[data-hxp-budget-restore]');
    if(restore && !restore.dataset.hxpBound){
      restore.dataset.hxpBound='1';
      restore.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        budgetSummaryMinimized=false;
        refreshBudgetSummary();
      });
    }

    const dismiss=root?.querySelector('[data-hxp-budget-dismiss]');
    if(dismiss && !dismiss.dataset.hxpBound){
      dismiss.dataset.hxpBound='1';
      dismiss.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        budgetSummaryMinimized=true;
        refreshBudgetSummary();
      });
    }

    const toggle=root?.querySelector('[data-hxp-budget-toggle]');
    if(toggle && !toggle.dataset.hxpBound){
      toggle.dataset.hxpBound='1';
      toggle.addEventListener('click',event=>{
        event.stopPropagation();
        const pop=root.querySelector('[data-hxp-budget-popover]');
        if(!pop) return;
        const opening=pop.hidden;
        pop.hidden=!opening;
        toggle.setAttribute('aria-expanded',String(opening));
      });
    }
    const go=root?.querySelector('[data-hxp-budget-go]');
    if(go && !go.dataset.hxpBound){
      go.dataset.hxpBound='1';
      go.addEventListener('click',event=>{
        event.stopPropagation();
        closeExplorer();
        requestAnimationFrame(()=>{
          const budget=document.querySelector('.budget-card');
          budget?.scrollIntoView?.({behavior:'smooth',block:'start'});
        });
      });
    }
  }

  function render(options = {}){
    const root = byId('familiasGrid');
    if(!root) return;
    const currentQuickStrip = root.querySelector('.hxp-type-strip');
    if(currentQuickStrip && isMobile()) quickStripScrollLeft = currentQuickStrip.scrollLeft || 0;
    const active = document.activeElement;
    const restoreSearch = active?.id === 'hxpSearch';
    const selectionStart = restoreSearch ? active.selectionStart : null;
    const scroll = byId('hxpProductsScroll')?.scrollTop || 0;

    const showProducts = Boolean(state.familyKey || clean(state.query));
    state.view = showProducts ? 'products' : 'home';
    root.innerHTML = `<div class="hxp-app">${showProducts ? productsView() : homeView()}${drawerHtml()}${budgetSummaryHtml()}</div>`;
    bind(root);
    bindBudgetSummary(root);
    if(isMobile()) requestAnimationFrame(() => { const strip = root.querySelector('.hxp-type-strip'); if(strip) strip.scrollLeft = quickStripScrollLeft; });

    if(options.preserveScroll){
      const scroller = byId('hxpProductsScroll');
      if(scroller) scroller.scrollTop = scroll;
    }
    if(restoreSearch){
      requestAnimationFrame(() => {
        const input = byId('hxpSearch');
        input?.focus({preventScroll:true});
        if(input && selectionStart != null) input.setSelectionRange(selectionStart, selectionStart);
      });
    }
    if(state.drawerOpen){
      requestAnimationFrame(() => root.querySelector('.hxp-drawer-close')?.focus({preventScroll:true}));
    }
  }

  function openFilters(){
    drawerDraft = JSON.parse(JSON.stringify(state.filters || {}));
    drawerQuickDraft = state.quickGroup || '';
    state.drawerOpen = true;
    lastFocused = document.activeElement;
    render({preserveScroll:true});
  }

  function closeFilters(){
    state.drawerOpen = false;
    render({preserveScroll:true});
    requestAnimationFrame(() => lastFocused?.focus?.({preventScroll:true}));
  }

  function updateDrawerPreview(root){
    const count = resultItems(drawerDraft, drawerQuickDraft).length;
    const apply = root.querySelector('[data-hxp-apply]');
    if(apply) apply.textContent = `Ver ${count} producto${count===1?'':'s'}`;
    const summary = root.querySelector('#hxpFilterSummary');
    if(summary) summary.textContent = selectedFilterSummary(drawerDraft, drawerQuickDraft);

    const groups = buildContextualFacets(definitionItemsForQuick(drawerQuickDraft), drawerDraft, drawerQuickDraft);
    const countMap = new Map();
    groups.forEach(group => group.values.forEach(value => countMap.set(`${group.key}::${value.id}`, value.count)));

    root.querySelectorAll('[data-hxp-facet]').forEach(input => {
      const valueCount = countMap.get(`${input.dataset.hxpFacet}::${input.value}`) || 0;
      const label = input.closest('.hxp-filter-option');
      const counter = label?.querySelector('em');
      if(counter) counter.textContent = valueCount;
      const disabled = valueCount === 0 && !input.checked;
      input.disabled = disabled;
      label?.classList.toggle('is-disabled', disabled);
    });
  }

  function selectFamily(key){
    state.familyKey = key;
    state.query = '';
    state.filters = {};
    state.quickGroup = '';
    state.sort = defaultSortForFamily(key);
    state.drawerOpen = false;
    render();
    requestAnimationFrame(resetSearchResultsScroll);
  }

  function goHome(){
    state.familyKey = '';
    state.familyFilter = '';
    state.query = '';
    state.filters = {};
    state.quickGroup = '';
    state.drawerOpen = false;
    state.sort = 'price-ref';
    quickStripScrollLeft = 0;
    render();
  }

  function addProduct(index, trigger){
    const quantity = typeof hxModalQtyGet === 'function' ? hxModalQtyGet('explorer', index) : 1;
    const card = trigger?.closest('.hxp-product');
    let ok = false;
    try{
      ok = typeof hxAddProductoModal === 'function'
        ? hxAddProductoModal('explorer', Number(index), quantity, card?.dataset.ref, card?.dataset.pvp)
        : false;
    }catch(error){ console.error('[Explorer Pro] no se pudo añadir', error); }
    if(ok){
      refreshBudgetSummary();
    }
    if(ok && trigger){
      if(trigger.dataset.hxpFeedback==='1') return;
      trigger.dataset.hxpFeedback='1';
      trigger.disabled=true;
      trigger.textContent = quantity>1 ? `✓ ${quantity} uds` : '✓ Añadido';
      trigger.classList.add('is-added');
      setTimeout(() => {
        const current=typeof hxModalQtyGet==='function'?hxModalQtyGet('explorer',Number(index)):1;
        trigger.textContent=current>1?`Añadir ${current}`:'Añadir';
        trigger.classList.remove('is-added');
        trigger.disabled=false;
        delete trigger.dataset.hxpFeedback;
      }, 800);
    }
  }

  function resetSearchResultsScroll(){
    const reset = () => {
      const scroller=byId('hxpProductsScroll');
      if(!scroller) return;
      scroller.scrollTop=0;
      try{ scroller.scrollTo({top:0,left:0,behavior:'auto'}); }catch(_error){}
    };

    // Safari/iOS puede restaurar el scroll con inercia tras sustituir la lista.
    reset();
    requestAnimationFrame(() => {
      reset();
      requestAnimationFrame(reset);
    });
    setTimeout(reset,60);
  }

  function refreshSearchResults(){
    const scroller = byId('hxpProductsScroll');

    // Primera búsqueda desde la portada: un único render para entrar en resultados.
    if(!scroller){
      render();
      return;
    }

    const items = resultItems();
    scroller.innerHTML = items.map(productCard).join('') || `<div class="hxp-empty hxp-empty-products"><strong>No hay productos con esta búsqueda.</strong></div>`;
    resetSearchResultsScroll();

    const count = document.querySelector('#familiasGrid .hxp-result-count');
    if(count) count.innerHTML = `<strong>${items.length}</strong> producto${items.length===1?'':'s'}`;
    const compactCount = document.querySelector('#familiasGrid .hxp-mobile-compact-title em');
    if(compactCount) compactCount.textContent = String(items.length);

    // Los rápidos no se reconstruyen por cada letra. Se recalculan al aplicar filtros,
    // cambiar de familia o pulsar un rápido.
    bindDynamicResults(byId('familiasGrid'));
  }

  function bindQuickScroll(root){
    if(!root) return;
    root.querySelectorAll('[data-hxp-quick-scroll]').forEach(shell => {
      const strip = shell.querySelector('.hxp-type-strip');
      const left = shell.querySelector('[data-hxp-quick-left]');
      const right = shell.querySelector('[data-hxp-quick-right]');
      if(!strip || !left || !right) return;

      const update = () => {
        const overflow = strip.scrollWidth > strip.clientWidth + 2;
        const first = strip.firstElementChild;
        const last = strip.lastElementChild;

        // La visibilidad se decide por lo que realmente se ve en pantalla,
        // no por scrollLeft. En escritorio algunos navegadores pueden dejar
        // un scrollLeft residual/fraccional aunque visualmente estemos al inicio.
        const stripRect = strip.getBoundingClientRect();
        const firstRect = first?.getBoundingClientRect();
        const lastRect = last?.getBoundingClientRect();

        const hasHiddenLeft = !!(overflow && firstRect && firstRect.left < stripRect.left - 4);
        const hasHiddenRight = !!(overflow && lastRect && lastRect.right > stripRect.right + 4);

        shell.classList.toggle('has-overflow', overflow);
        left.classList.toggle('is-visible', hasHiddenLeft);
        right.classList.toggle('is-visible', hasHiddenRight);
      };

      if(!shell.dataset.hxpScrollBound){
        shell.dataset.hxpScrollBound='1';
        left.classList.remove('is-visible');

        left.addEventListener('click', () => {
          strip.scrollBy({left:-Math.max(220, strip.clientWidth*.6), behavior:'smooth'});
        });
        right.addEventListener('click', () => {
          strip.scrollBy({left:Math.max(220, strip.clientWidth*.6), behavior:'smooth'});
        });
        strip.addEventListener('scroll', update, {passive:true});

        requestAnimationFrame(() => {
          // En escritorio cada nueva tira empieza realmente desde el inicio.
          // En móvil render() restaura después su posición horizontal guardada.
          if(!isMobile()) strip.scrollTo({left:0, behavior:'auto'});
          update();
        });
      }else{
        requestAnimationFrame(update);
      }
    });
  }

  function bindMobileCondense(root){
    const modal = byId('familiasModal');
    const scroller = root?.querySelector('#hxpProductsScroll');
    if(!modal) return;
    if(!isMobile() || !scroller){
      modal.classList.remove('hxp-mobile-condensed');
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      modal.classList.toggle('hxp-mobile-condensed', scroller.scrollTop > 30);
    };
    scroller.addEventListener('scroll', () => {
      if(frame) return;
      frame = requestAnimationFrame(update);
    }, {passive:true});
    update();
  }

  function bindDynamicResults(root){
    if(!root) return;
    bindQuickScroll(root);
    root.querySelectorAll('[data-hxp-quick]').forEach(button => {
      if(button.dataset.hxpBound) return;
      button.dataset.hxpBound = '1';
      button.addEventListener('click', () => {
        const value = button.dataset.hxpQuick || '';
        state.quickGroup = value && state.quickGroup === value ? '' : value;
        refreshSearchResults();
      });
    });
    root.querySelectorAll('[data-hxp-add]').forEach(button => {
      if(button.dataset.hxpBound) return;
      button.dataset.hxpBound='1';
      button.addEventListener('click', () => addProduct(button.dataset.hxpAdd, button));
    });
    // Resultados dinámicos de búsqueda: usar el mismo visor de imágenes
    // que el catálogo normal. Antes se llamaba a abrirImagenProducto(),
    // función inexistente, por eso la miniatura no hacía nada.
    try{
      if(typeof hxBindProductImages === 'function') hxBindProductImages(root);
    }catch(error){ console.warn(error); }
  }

  function bind(root){
    bindQuickScroll(root);
    bindMobileCondense(root);

    if(!root.dataset.hxpDetailDelegateBound){
      root.dataset.hxpDetailDelegateBound='1';
      root.addEventListener('click', event => {
        const button=event.target.closest('[data-hxp-description-toggle]');
        if(!button || !root.contains(button)) return;
        event.preventDefault();
        event.stopPropagation();
        const card=button.closest('.hxp-product');
        if(!card) return;
        const opening=!card.classList.contains('is-detail-open');
        card.classList.toggle('is-detail-open',opening);
        button.setAttribute('aria-expanded',String(opening));
        button.setAttribute('aria-label',opening?'Ocultar detalle':'Ver detalle');
        button.setAttribute('title',opening?'Ocultar detalle':'Ver detalle');
        const icon=button.querySelector('.hxp-detail-icon');
        if(icon) icon.textContent=opening?'⌃':'⌄';
      });
      root.addEventListener('keydown', event => {
        if(event.key!=='Enter' && event.key!==' ') return;
        const control=event.target.closest('[data-hxp-description-toggle]');
        if(!control || !root.contains(control)) return;
        event.preventDefault();
        control.click();
      });
    }
    const search = byId('hxpSearch');
    if(search){
      search.addEventListener('input', event => {
        state.query = event.target.value;
        clearTimeout(searchTimer);

        // No sustituir el input mientras el usuario está escribiendo.
        // La portada pasa a resultados después de una pausa breve, conservando
        // todas las teclas aunque se escriba rápido.
        if(!byId('hxpProductsScroll')){
          if(!clean(state.query)) return;
          // Esperar a que el usuario termine de escribir antes de cambiar de portada
          // a resultados. Así no sustituimos el input a mitad de una palabra.
          searchTimer = setTimeout(() => {
            if(!clean(state.query) || byId('hxpProductsScroll')) return;
            render();
            requestAnimationFrame(() => {
              resetSearchResultsScroll();
              const next = byId('hxpSearch');
              next?.focus({preventScroll:true});
              if(next) next.setSelectionRange(next.value.length,next.value.length);
            });
          }, 140);
          return;
        }

        // En resultados nunca reconstruimos el buscador: solo la lista.
        searchTimer = setTimeout(() => refreshSearchResults(), 120);
      });
      search.addEventListener('keydown', event => {
        if(event.key === 'Escape' && state.query){
          event.preventDefault();
          state.query = '';
          render();
        }
      });
    }

    root.querySelector('[data-hxp-clear-search]')?.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      state.query = '';

      const current = byId('hxpSearch');
      if(current) current.value = '';

      // Al borrar búsqueda volvemos a navegación normal y desaparecen resultados.
      render({preserveScroll:false});

      requestAnimationFrame(() => {
        const input = byId('hxpSearch');
        if(input){
          input.value = '';
          input.focus({preventScroll:true});
        }
      });
    });

    const familyFilter = byId('hxpFamilyFilter');
    familyFilter?.addEventListener('input', event => {
      state.familyFilter = event.target.value;
      render();
      requestAnimationFrame(() => {
        const input = byId('hxpFamilyFilter');
        input?.focus({preventScroll:true});
        input?.setSelectionRange(input.value.length,input.value.length);
      });
    });

    const quickStrip = root.querySelector('.hxp-type-strip');
    quickStrip?.addEventListener('scroll', () => { if(isMobile()) quickStripScrollLeft = quickStrip.scrollLeft || 0; }, {passive:true});
        root.querySelectorAll('[data-hxp-family]').forEach(button => button.addEventListener('click', () => selectFamily(button.dataset.hxpFamily)));
    root.querySelectorAll('[data-hxp-home]').forEach(button => button.addEventListener('click', goHome));
    root.querySelectorAll('[data-hxp-close-explorer]').forEach(button => button.addEventListener('click', closeExplorer));
    root.querySelectorAll('[data-hxp-open-filters]').forEach(button => button.addEventListener('click', openFilters));
    root.querySelectorAll('[data-hxp-close-filters]').forEach(button => button.addEventListener('click', closeFilters));

    root.querySelectorAll('[data-hxp-sort-control]').forEach(select => select.addEventListener('change', event => {
      state.sort = event.target.value;
      render({preserveScroll:false});
    }));

    root.querySelectorAll('[data-hxp-quick]').forEach(button => button.addEventListener('click', () => {
      const value = button.dataset.hxpQuick || '';
      state.quickGroup = value && state.quickGroup === value ? '' : value;
      render({preserveScroll:false});
      requestAnimationFrame(() => byId('hxpProductsScroll')?.scrollTo({top:0}));
    }));

    root.querySelectorAll('[data-hxp-facet]').forEach(input => input.addEventListener('change', () => {
      const key = input.dataset.hxpFacet;
      const selected = new Set(drawerDraft[key] || []);
      if(input.checked) selected.add(input.value);
      else selected.delete(input.value);
      if(selected.size) drawerDraft[key] = [...selected];
      else delete drawerDraft[key];
      updateDrawerPreview(root);
    }));

    root.querySelector('[data-hxp-draft-clear]')?.addEventListener('click', () => {
      drawerDraft = {};
      drawerQuickDraft = '';
      root.querySelectorAll('[data-hxp-facet]').forEach(input => { input.checked = false; });
      updateDrawerPreview(root);
    });

    root.querySelector('[data-hxp-apply]')?.addEventListener('click', () => {
      state.filters = JSON.parse(JSON.stringify(drawerDraft));
      state.quickGroup = drawerQuickDraft;
      state.drawerOpen = false;
      render();
    });

    root.querySelector('[data-hxp-clear-filters]')?.addEventListener('click', () => {
      state.filters = {};
      state.quickGroup = '';
      render();
    });

    root.querySelectorAll('[data-hxp-add]').forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      addProduct(Number(button.dataset.hxpAdd), button);
    }));

    root.querySelectorAll('.hxp-product').forEach(card => card.addEventListener('dblclick', event => {
      if(event.target.closest('button')) return;
      addProduct(Number(card.dataset.index), null);
    }));

    try{ if(typeof hxBindQtyControls === 'function') hxBindQtyControls(root, 'explorer'); }catch(error){ console.warn(error); }
    try{ if(typeof hxBindProductImages === 'function') hxBindProductImages(root); }catch(error){ console.warn(error); }
  }


  window.HXA_EXPLORER_QUICK_AUDIT = function(ref){
    const needle = norm(ref || '');
    const model = buildModel();
    const item = model.allItems.find(x => norm(x.p?.name || '') === needle || norm(x.p?.name || '').includes(needle));
    if(!item) return {found:false,ref};
    const families = model.families
      .filter(f => f.items.some(x => x.index === item.index))
      .map(f => ({family:f.displayTitle||f.familyTitle, quicks:quickGroupsForItem(item,f)}));
    return {
      found:true,
      catalogSignature:productSignature(),
      ref:item.p?.name,
      product_type:item.p?.product_type || '',
      subcategory:item.subcategory || '',
      families
    };
  };

  window.HXA_EXPLORER_CLASSIFY = function(ref){
    const needle = norm(ref || '');
    const model = buildModel();
    const item = model.allItems.find(x => norm(x.p?.name || '') === needle);
    if(!item) return {found:false,ref};
    const family = model.byFamily.get(item.familyKey);
    const ctx = quickContext(item);
    return {
      found:true,
      ref:item.p?.name,
      family:family?.displayTitle || family?.familyTitle,
      category:item.category,
      subcategory:item.subcategory,
      product_type:item.p?.product_type || '',
      quicks:quickGroupsForItem(item,family),
      structured:ctx.structuredSource,
      fallback:ctx.fallback
    };
  };

  function openExplorer(){
    const modal = byId('familiasModal');
    if(!modal) return;
    state = freshState();
    drawerDraft = {};
    budgetSummaryMinimized = false;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
    render();
    requestAnimationFrame(() => byId('hxpSearch')?.focus({preventScroll:true}));
  }

  function closeExplorer(){
    const modal = byId('familiasModal');
    if(!modal || modal.classList.contains('hidden')) return;
    if(state.drawerOpen){ closeFilters(); return; }
    try{ if(typeof hxResetModalQty === 'function') hxResetModalQty('explorer'); }catch(_error){}
    try{ if(typeof hxResetModalSession === 'function') hxResetModalSession('explorer'); }catch(_error){}
    modal.classList.add('hidden');
    modal.classList.remove('hxp-mobile-condensed');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    state = freshState();
  }

  function install(){
    const button = byId('btnFamilias');
    if(button){
      button.addEventListener('click', event => {
        event.preventDefault();
        openExplorer();
      }, true);
    }
    byId('familiasClose')?.addEventListener('click', event => {
      event.preventDefault();
      closeExplorer();
    }, true);
    byId('familiasBackdrop')?.addEventListener('click', event => {
      event.preventDefault();
      closeExplorer();
    }, true);

    // Resumen del presupuesto: la X minimiza, nunca cierra Explorer.
    // Captura evita que un tap móvil alcance listeners de cierre del modal.
    byId('familiasGrid')?.addEventListener('click', event => {
      const dismiss = event.target.closest?.('[data-hxp-budget-dismiss]');
      if(!dismiss) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      budgetSummaryMinimized = true;
      refreshBudgetSummary();
    }, true);

    // La burbuja minimizada restaura el resumen.
    byId('familiasGrid')?.addEventListener('click', event => {
      const restore = event.target.closest?.('[data-hxp-budget-restore]');
      if(!restore) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      budgetSummaryMinimized = false;
      refreshBudgetSummary();
    }, true);

    // Navegación interna robusta: funciona aunque render() sustituya los botones.
    byId('familiasGrid')?.addEventListener('click', event => {
      const home = event.target.closest?.('[data-hxp-home]');
      if(!home) return;
      event.preventDefault();
      event.stopPropagation();
      goHome();
    });
    document.addEventListener('keydown', event => {
      if(event.key !== 'Escape') return;
      const modal = byId('familiasModal');
      if(!modal || modal.classList.contains('hidden')) return;
      event.preventDefault();
      closeExplorer();
    }, true);
    window.addEventListener('resize', () => {
      const modal = byId('familiasModal');
      if(modal && !modal.classList.contains('hidden')) render({preserveScroll:true});
    });
    window.addEventListener('hx:catalogo-cargado', () => {
      modelCache = null;
      modelSignature = '';
      const modal = byId('familiasModal');
      if(modal && !modal.classList.contains('hidden')) render();
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();

  window.abrirFamilias = openExplorer;
  window.renderFamilias = render;
  function auditProduct(reference){
    const needle = norm(reference);
    const model = buildModel();
    const item = model.allItems.find(candidate => norm(candidate.p?.name || '') === needle)
      || model.allItems.find(candidate => norm(candidate.p?.name || '').includes(needle));
    if(!item) return null;
    const family = model.byFamily.get(item.familyKey);
    return {
      reference:item.p?.name || '',
      family:family?.displayTitle || item.family,
      profile:familyQuickProfile(family),
      quickFilters:quickGroupsForItem(item, family),
      facets:facetValues(item)
    };
  }

  function auditFamilies(){
    const model = buildModel();
    return model.families.map(family => ({
      family:family.displayTitle,
      products:family.count,
      profile:familyQuickProfile(family),
      quickFilters:quickGroups(family.items, family).map(group => ({name:group.label,count:group.count}))
    }));
  }

  function auditSearch(query, limit = 10){
    return rankedSearch(buildModel().allItems, query).slice(0, Math.max(1,Number(limit)||10)).map(item => ({
      reference:item.p?.name || '',
      description:safeDescription(item.p),
      family:buildModel().byFamily.get(item.familyKey)?.displayTitle || item.family
    }));
  }

  function auditFilters(familyName, quickGroup = '', filters = {}){
    const model = buildModel();
    const family = model.families.find(candidate => norm(candidate.displayTitle) === norm(familyName))
      || model.families.find(candidate => norm(candidate.displayTitle).includes(norm(familyName)));
    if(!family) return null;
    const definitionItems = isRelatedQuickGroup(quickGroup, family)
      ? cameraSupportItems(model)
      : family.items.slice();
    const quickItems = quickGroup
      ? (isRelatedQuickGroup(quickGroup, family)
          ? definitionItems
          : definitionItems.filter(item => quickGroupsForItem(item, family).includes(quickGroup)))
      : definitionItems;
    const facets = buildContextualFacets(definitionItems, filters, quickGroup, family).map(group => ({
      key:group.key,
      label:group.label,
      values:group.values.map(value => ({title:value.title,count:value.count,disabled:value.count===0 && !(filters[group.key]||[]).includes(value.id)}))
    }));
    return {family:family.displayTitle,quickGroup,products:applyFilters(quickItems,filters).length,facets};
  }


  /* =====================================================
     CLASIFICACIÓN TEMÁTICA PARA EL BUSCADOR
     Fuente: clasificación final y atajos reales de Explorer.
     Solo ordena candidatos ya encontrados.
     ===================================================== */
  let hxaSearchClassSignature = '';
  let hxaSearchClassByProduct = new WeakMap();

  function hxaRefreshSearchClassification(){
    const signature = productSignature();
    if(signature === hxaSearchClassSignature) return;

    const model = buildModel();
    hxaSearchClassByProduct = new WeakMap();

    model.allItems.forEach(item => {
      if(!item?.p || typeof item.p !== 'object') return;

      const family = model.byFamily.get(item.familyKey);
      const quicks = family ? quickGroupsForItem(item, family) : [];

      hxaSearchClassByProduct.set(item.p, {
        category:item.category || '',
        family:item.family || '',
        subcategory:item.subcategory || '',
        familyTitle:family?.familyTitle || '',
        displayTitle:family?.displayTitle || '',
        profile:familyQuickProfile(family),
        quicks
      });
    });

    hxaSearchClassSignature = signature;
  }

  window.HXA_EXPLORER_CLASSIFICATION = function(product){
    hxaRefreshSearchClassification();
    return hxaSearchClassByProduct.get(product) || null;
  };

  // Orden natural ya existente en Explorer. Se calcula con sortItems()
  // y solo se usa como desempate dentro de un grupo temático equivalente.
  function hxaSearchVariantInfo(item){
    const product=item?.p || {};
    const reference=norm(product.name || '');
    const color=norm(colorFacet(product));

    // Tokens visuales/color genéricos; no contiene modelos concretos.
    const colorTokens=new Set([
      'b','w','g','gra','gray','grey','gris',
      'black','negro','white','blanco',
      'red','rojo','blue','azul','green','verde','yellow','amarillo'
    ]);

    const parts=reference.split(/[\s\-_\/]+/).filter(Boolean);
    const withoutColor=parts.filter(part=>!colorTokens.has(part));

    // Modelo base: primer bloque de identidad antes de variantes técnicas.
    // Mantiene juntas las parejas normales B/W cuando el precio empata.
    const base=withoutColor.length ? withoutColor[0] : reference;

    const special=withoutColor.slice(1).join('-');

    const colorRank=(()=>{
      if(color.includes('blanco') || color.includes('white')) return 1;
      if(color.includes('negro') || color.includes('black')) return 0;
      if(color.includes('gris') || color.includes('grey') || color.includes('gray')) return 2;
      return color ? 3 : 9;
    })();

    return {base,special,colorRank,reference};
  }

  window.HXA_EXPLORER_NATURAL_ORDER = function(product){
    if(!product || typeof product !== 'object') return Number.MAX_SAFE_INTEGER;

    const model=buildModel();
    const item=model.allItems.find(candidate=>candidate.p===product)
      || model.allItems.find(candidate=>norm(candidate.p?.name||'')===norm(product.name||''));

    if(!item) return Number.MAX_SAFE_INTEGER;

    const familyItems=model.allItems.filter(candidate=>candidate.familyKey===item.familyKey);

    // Orden natural del buscador dentro de la familia:
    // prioridad comercial CSV -> precio -> modelo base -> color -> variante -> referencia.
    const ordered=familyItems.slice().sort((a,b)=>{
      // Prioridad comercial mantenible desde catalogo_manual.csv (campo order).
      // Solo actúa dentro del grupo temático ya correcto.
      const commercialOrder = product => {
        const value=Number(product?.order);
        return Number.isFinite(value) && value>0 ? value : Number.MAX_SAFE_INTEGER;
      };

      const ao=commercialOrder(a.p);
      const bo=commercialOrder(b.p);
      if(ao!==bo) return ao-bo;

      const ap=Number(a.p?.pvp)||0;
      const bp=Number(b.p?.pvp)||0;
      if(!ap && bp) return 1;
      if(ap && !bp) return -1;
      if(ap!==bp) return ap-bp;

      const av=hxaSearchVariantInfo(a);
      const bv=hxaSearchVariantInfo(b);

      return collator.compare(av.base,bv.base)
        || av.special.length-bv.special.length
        || av.colorRank-bv.colorRank
        || collator.compare(av.special,bv.special)
        || collator.compare(av.reference,bv.reference);
    });

    const index=ordered.findIndex(candidate=>candidate.index===item.index);
    return index>=0 ? index : Number.MAX_SAFE_INTEGER;
  };



  function hxaDecorateCompatibles(){
    const api=window.HX_COMPATIBLES;
    if(!api) return;
    document.querySelectorAll('[data-hxp-add]').forEach(addButton=>{
      if(addButton.dataset.hxCompatDecorated==='1') return;
      const index=Number(addButton.getAttribute('data-hxp-add'));
      const product=Number.isFinite(index) ? productos[index] : null;
      if(!product) return;
      const count=api.count(product);
      if(!count) return;

      addButton.dataset.hxCompatDecorated='1';
      const button=document.createElement('button');
      button.type='button';
      button.className='hx-compat-btn hxp-compatible-btn';
      button.setAttribute('aria-label',`Ver ${count} compatibles`);
      button.title=`${count} compatible${count===1?'':'s'}`;
      button.innerHTML=`<span class="hxp-compatible-mark" aria-hidden="true">
        <svg class="hxp-compatible-icon" viewBox="0 0 24 24">
<circle cx="12" cy="12" r="5.2"></circle>
<circle cx="3.5" cy="12" r="1.8"></circle>
<circle cx="20.5" cy="12" r="1.8"></circle>
<path d="M5.3 12h1.5M17.2 12h1.5"></path>
<path d="M9.6 12.1l1.6 1.7 3.4-3.7"></path>
</svg>
        <span class="hxp-compatible-count">${count}</span>
      </span>`;
      button.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        api.open(product);
      });
      addButton.parentNode?.insertBefore(button,addButton);
    });
  }

  const hxaCompatObserver=new MutationObserver(()=>requestAnimationFrame(hxaDecorateCompatibles));
  function hxaStartCompatibles(){
    const root=byId('hxpRoot') || document.body;
    hxaCompatObserver.observe(root,{childList:true,subtree:true});
    requestAnimationFrame(hxaDecorateCompatibles);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',hxaStartCompatibles,{once:true});
  else hxaStartCompatibles();

  window.HX_EXPLORER_REFRESH_BUDGET = ()=>{ try{ budgetSummaryMinimized=false; refreshBudgetSummary(); }catch(_error){} };

  window.HX_EXPLORER_PRO = {
    open:openExplorer,
    close:closeExplorer,
    render,
    audit:auditProduct,
    auditFamilies,
    auditSearch,
    auditFilters,
    quickAddData(familyNames=[]){
      const model=buildModel();
      const wanted=(Array.isArray(familyNames)?familyNames:[]).map(value=>norm(value));
      return model.families
        .filter(f=>!wanted.length || wanted.some(n=>norm(f.displayTitle)===n || norm(f.displayTitle).includes(n)))
        .map(f=>{
          const isCctvAccessories=norm(f.displayTitle)==='accesorios cctv';
          const groups=isCctvAccessories
            ? [{
                name:'Soportes',
                products:cameraSupportItems(model).map(item=>({
                  reference:item.p?.name||'',
                  image:item.p?.image||item.p?.image_url||item.p?.imagen||'',
                  price:Number(item.p?.pvp)||0,
                  color:colorFacet(item.p)||'',
                  stock:item.p?.stock??''
                }))
              }]
            : quickGroups(f.items,f).map(g=>({
                name:g.label,
                products:f.items
                  .filter(item=>quickGroupsForItem(item,f).includes(g.label))
                  .map(item=>({
                    reference:item.p?.name||'',
                    image:item.p?.image||item.p?.image_url||item.p?.imagen||'',
                    price:Number(item.p?.pvp)||0,
                    color:colorFacet(item.p)||'',
                    stock:item.p?.stock??''
                  }))
              }));
          return {family:f.displayTitle,groups};
        });
    },
    resetCache(){
      modelCache = null;
      modelSignature = '';
    },
    version:'7.7.0-catalogo-expandido'
  };
})();
