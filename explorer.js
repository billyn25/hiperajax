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
    ['central','centrales','hub','hubs'],
    ['detector','detectores','intrusion','intrusión'],
    ['sirena','sirenas'],
    ['teclado','teclados','mando','mandos'],
    ['camara','cámara','camaras','cámaras','videovigilancia'],
    ['nvr','grabador','grabadores','grabacion','grabación'],
    ['incendio','fuego','fire'],
    ['red','poe','network'],
    ['accesorio','accesorios','soporte','soportes'],
    ['alimentacion','alimentación','bateria','batería'],
    // Estas familias se fuerzan al final en este orden.
    ['smart home','smarthome','domotica','domótica','automatizacion','automatización','confort'],
    ['almacenamiento nube','almacenamiento en nube','cloud storage','cloud'],
    ['repuesto','repuestos','recambio','recambios'],
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
    detectors:['Movimiento','Apertura','MotionCam','PhOD','Cristal','Combi','Exterior','Cortina','Incendio'],
    smart_home:['Interruptores','Enchufes','Timbre','Válvulas','Clima / Aire','Accesorios','Relés'],
    centrals:['Hub','Hub 2','4G / LTE','Wi‑Fi','Hub Plus','Hybrid','Repetidores'],
    nvr:['4 canales','8 canales','16 canales','32+ canales','HDMI'],
    wireless_accessories:['Teclados','Sirenas','Relés','Botones / Mandos','Enchufes','Válvulas','Repetidores','LifeQuality']
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
  const slug = value => norm(clean(value)).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'otros';
  const byId = id => document.getElementById(id);

  let state = freshState();
  let modelCache = null;
  let modelSignature = '';
  let searchIndexSignature = '';
  let searchIndexCache = new Map();
  let searchTimer = null;
  let drawerDraft = {};
  let drawerQuickDraft = '';
  let lastFocused = null;

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

    const canonical = canonicalClassification(category, family);
    return {
      category:canonical.category,
      family:canonical.family,
      subcategory:subcategory || 'Todos'
    };
  }

  function familyPriority(entry){
    const text = norm(`${entry.familyTitle} ${entry.categoryTitle}`);
    const late = [
      {terms:['smart home','smarthome','domotica','domótica','automatizacion','automatización','confort'], rank:900},
      {terms:['almacenamiento nube','almacenamiento en nube','cloud storage','cloud'], rank:910},
      {terms:['repuesto','repuestos','recambio','recambios'], rank:920},
      {terms:['merchandising','merchan'], rank:930},
      {terms:['incendio','fuego','fire','fireprotect'], rank:940},
      {terms:['productos añadidos','productos anadidos','otros productos'], rank:950}
    ];
    const lateMatch = late.find(group => group.terms.some(term => text.includes(norm(term))));
    if(lateMatch) return lateMatch.rank;
    const found = FAMILY_PRIORITY.findIndex(group => group.some(term => text.includes(norm(term))));
    if(found >= 0) return found;
    if(norm(entry.categoryTitle).includes('sin categoria')) return 999;
    return 100;
  }

  function currentProducts(){ return Array.isArray(productos) ? productos : []; }

  function productSignature(){
    const list = currentProducts();
    const first = list[0]?.name || '';
    const last = list[list.length - 1]?.name || '';
    return `${list.length}|${first}|${last}`;
  }

  function representativeProduct(family){
    const withImage = family.items.filter(item => clean(item.p?.image));
    if(!withImage.length) return family.items[0]?.p || null;
    const familyText = norm(`${family.familyTitle} ${family.categoryTitle}`);
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

  function canonicalClassification(categoryValue, familyValue){
    let category = clean(categoryValue);
    let family = clean(familyValue);
    const c = norm(category);
    const f = norm(family);
    const combined = norm(`${category} ${family}`);

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
      else if(/ajax cctv/.test(pair) && /^accesorios$/.test(norm(family.familyTitle))) displayTitle = 'Accesorios CCTV';
      else if(/ajax cctv/.test(pair) && /^kits$/.test(norm(family.familyTitle))) displayTitle = 'Kits CCTV';
      else if(/^nvrs?$/.test(norm(family.familyTitle))) displayTitle = 'NVRs';
      else if(/^nube$/.test(norm(family.familyTitle))) displayTitle = 'Nube';
      family.displayTitle = displayTitle;
      family.context = displayTitle === 'Otros productos' ? 'Productos añadidos manualmente'
        : (cleanCategory && norm(cleanCategory) !== norm(displayTitle) ? cleanCategory : '');
      family.representative = representativeProduct(family);
    });



    const byFamily = new Map(families.map(family => [family.key, family]));
    modelCache = { allItems, families, byFamily };
    modelSignature = signature;
    return modelCache;
  }

  function currentFamily(model = buildModel()){
    if(state.familyKey === '__popular__') return popularFamily(model);
    if(state.familyKey === '__all__'){
      return {
        key:'__all__',
        familyTitle:'Todos los productos',
        categoryTitle:'Catálogo completo',
        context:'Todo el catálogo Ajax',
        items:model.allItems.slice(),
        count:model.allItems.length,
        all:true
      };
    }
    return model.byFamily.get(state.familyKey) || null;
  }

  function popularFamily(model){
    const refMap = new Map(model.allItems.map(item => [clean(item.p?.name).toUpperCase(), item]));
    const items = [];
    const seen = new Set();

    // Primero se respetan los productos que realmente usa el usuario.
    try{
      const usage = typeof leerUsoProductos206 === 'function' ? leerUsoProductos206() : {};
      Object.entries(usage || {})
        .sort((a,b) => (Number(b[1]?.count)||0) - (Number(a[1]?.count)||0) || String(b[1]?.last||'').localeCompare(String(a[1]?.last||'')))
        .forEach(([ref]) => {
          const item = refMap.get(clean(ref).toUpperCase());
          if(item && !seen.has(item.index) && items.length < 24){
            seen.add(item.index);
            items.push(item);
          }
        });
    }catch(_error){}

    POPULAR_REFS.forEach(ref => {
      const item = refMap.get(ref);
      if(item && !seen.has(item.index)){
        seen.add(item.index);
        items.push(item);
      }
    });
    if(items.length < 10){
      model.families.slice(0, 7).forEach(family => {
        family.items.slice(0, 2).forEach(item => {
          if(items.length < 20 && !seen.has(item.index)){
            seen.add(item.index);
            items.push(item);
          }
        });
      });
    }
    return {
      key:'__popular__',
      familyTitle:'Más usados',
      categoryTitle:'Acceso rápido',
      context:'Referencias habituales',
      items,
      count:items.length,
      popular:true
    };
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


  function searchAliases(query){
    const q = norm(query);
    return SEARCH_ALIAS_RULES.filter(entry => entry.rx.test(q)).map(entry => entry.add).join(' ');
  }

  function productQuickText(item){
    const family = buildModel().byFamily.get(item.familyKey);
    return family ? quickGroupsForItem(item, family).join(' ') : '';
  }

  function productSearchText(item){
    const product = item.p || {};
    const attributes = product.attributes && typeof product.attributes === 'object'
      ? Object.entries(product.attributes).flatMap(([key,value]) => [key,value]).join(' ')
      : '';
    return norm([
      product.name, product.brand, product.short_description, product.description,
      item.category, item.family, item.subcategory,
      product.product_type, product.series, product.technology, product.protocol,
      product.color, product.connectivity, product.resolution, product.environment,
      product.compatibility, attributes, productQuickText(item)
    ].filter(Boolean).join(' '));
  }

  function ensureSearchIndex(){
    const signature = productSignature();
    if(searchIndexSignature === signature && searchIndexCache.size) return searchIndexCache;

    searchIndexCache = new Map();
    buildModel().allItems.forEach(item => {
      const haystack = productSearchText(item);
      const ref = norm(item.p?.name || '');
      searchIndexCache.set(item.index, {
        haystack,
        compact:haystack.replace(/[^a-z0-9]/g,''),
        quick:norm(productQuickText(item)),
        ref,
        compactRef:ref.replace(/[^a-z0-9]/g,'')
      });
    });
    searchIndexSignature = signature;
    return searchIndexCache;
  }

  function rankedSearch(items, query){
    const q = clean(query);
    if(!q) return items.slice();

    const index = ensureSearchIndex();
    const needle = norm(q).replace(/\s+/g,' ');
    const compactNeedle = needle.replace(/[^a-z0-9]/g,'');
    const aliasQuery = searchAliases(q);
    const tokens = norm(`${q} ${aliasQuery}`).split(/\s+/).filter(token => token.length > 1);

    return items
      .map(item => {
        const entry = index.get(item.index);
        if(!entry) return {item,score:0};
        let score = 0;

        // Referencia: prioridad absoluta.
        if(entry.ref === needle || entry.compactRef === compactNeedle) score += 5000;
        else if(entry.ref.startsWith(needle) || entry.compactRef.startsWith(compactNeedle)) score += 2800;
        else if(entry.ref.includes(needle) || entry.compactRef.includes(compactNeedle)) score += 1800;

        // Texto precalculado: no vuelve a normalizar el catálogo en cada tecla.
        if(entry.haystack.includes(needle)) score += 900;
        if(compactNeedle && entry.compact.includes(compactNeedle)) score += 650;
        if(entry.quick && entry.quick.includes(needle)) score += 1600;

        let tokenHits = 0;
        let quickHits = 0;
        for(const token of tokens){
          if(entry.haystack.includes(token)) tokenHits += 1;
          if(entry.quick && entry.quick.includes(token)) quickHits += 1;
        }
        score += tokenHits * 110 + quickHits * 260;

        return {item,score};
      })
      .filter(result => result.score > 0)
      .sort((a,b) => b.score-a.score || collator.compare(a.item.p?.name||'',b.item.p?.name||''))
      .map(result => result.item);
  }

  function modelItemByIndex(index){ return buildModel().allItems.find(item => item.index === Number(index)) || null; }

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

  function filterHasValue(filters,key,valueId){
    return Array.isArray(filters?.[key]) && filters[key].includes(valueId);
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

    // Cámaras: precio + referencia para comparar gamas/precios rápidamente.
    if(/camara|cámara/.test(text)) return 'price-ref';

    if(/smart home|smarthome|domotica|domótica|automatizacion|automatización|confort/.test(text)) return 'type-ref-color';
    if(/detector|central|hub|sirena|teclado/.test(text)) return 'ref-color';
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

  function familyQueryItems(){
    const model = buildModel();
    let items = state.familyKey ? familyItems(model) : model.allItems.slice();
    if(clean(state.query)) items = rankedSearch(items, state.query);
    return items;
  }

  function definitionItemsForQuick(quickGroup = state.quickGroup, family = currentFamily(), model = buildModel()){
    let items = isRelatedQuickGroup(quickGroup, family)
      ? cameraSupportItems(model)
      : (family ? family.items.slice() : model.allItems.slice());
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
    if(clean(state.query) && state.sort === 'featured') return items;
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
      back:'<path d="m15 18-6-6 6-6"></path>',
      close:'<path d="M6 6l12 12M18 6 6 18"></path>',
      box:'<path d="m4 7 8-4 8 4-8 4z"></path><path d="M4 7v10l8 4 8-4V7M12 11v10"></path>',
      chevron:'<path d="m9 6 6 6-6 6"></path>',
      clear:'<path d="M5 12h14"></path>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ''}</svg>`;
  }

  function headerSearch(){
    const scope = state.familyKey ? (currentFamily()?.familyTitle || 'familia') : 'todo el catálogo';
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
    return `<label class="hxp-sort">
      <span>Orden</span>
      <select id="hxpSort" aria-label="Ordenar productos">
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

  function familyVisual(family){
    if(norm(family?.displayTitle) === 'otros productos'){
      return `<span class="hxp-family-visual hxp-family-visual-image"><img src="./assets/explorer/western-digital-purple.jpg" alt="Disco duro Western Digital Purple" loading="lazy"><b>O</b></span>`;
    }
    const product = family?.representative || null;
    const image = clean(product?.image);
    if(image){
      return `<span class="hxp-family-visual hxp-family-visual-image"><img src="${esc(image)}" alt="" loading="lazy" onerror="this.closest('.hxp-family-visual').classList.add('is-error')"><b>${esc((family.displayTitle||'?').slice(0,1).toUpperCase())}</b></span>`;
    }
    return `<span class="hxp-family-visual"><b>${esc((family?.displayTitle||'?').slice(0,1).toUpperCase())}</b></span>`;
  }

  function homeView(){
    const model = buildModel();
    const families = availableFamilyList(model);
    const total = model.allItems.length;
    const familyCards = families.map(family => `
      <button type="button" class="hxp-family-card" data-hxp-family="${esc(family.key)}">
        ${familyVisual(family)}
        <span class="hxp-family-copy">
          <strong>${esc(family.displayTitle)}</strong>
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
    if(/accesorio|accesorios/.test(text) && /inalambr|inalámbr|wireless/.test(text)) return 'wireless_accessories';
    if(/camara|cámara/.test(text)) return 'cameras';
    if(/detector|detectores|intrusion|intrusión/.test(text)) return 'detectors';
    if(/smart home|smarthome|domotica|domótica|automatizacion|automatización|confort/.test(text)) return 'smart_home';
    if(/\bnvrs?\b|grabador|grabacion|grabación/.test(text)) return 'nvr';
    if(/central|centrales|\bhub\b|hubs/.test(text)) return 'centrals';
    return '';
  }

  function quickContext(item){
    const p = item?.p || {};
    const attrs = normalizeAttributes(p);
    const identity = norm(`${p.name||''} ${p.short_description||''}`);
    const typeText = norm([
      item?.subcategory, p.product_type, p.tipo, p.series, p.technology, p.protocol,
      p.name, p.short_description
    ].filter(Boolean).join(' '));
    const featureText = norm([
      p.environment, p.photo, p.channels, p.connectivity, p.wifi, p.lte_4g,
      ...Object.entries(attrs).flatMap(([key,value]) => [key,value])
    ].filter(Boolean).join(' '));
    return {p, attrs, identity, typeText, featureText, source:`${typeText} ${featureText}`};
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

  function isCameraSupportItem(item){
    const p = item?.p || {};
    const attrs = normalizeAttributes(p);
    const familyText = norm(`${item?.family||''} ${item?.category||''} ${p.family||''} ${p.category||''}`);
    const typeText = norm([
      item?.subcategory, p.product_type, p.tipo, p.series,
      p.name, p.short_description,
      ...Object.entries(attrs).flatMap(([key,value]) => [key,value])
    ].filter(Boolean).join(' '));

    // Solo soportes reales de CCTV/cámara. Nunca cajas, cables, fuentes o kits.
    const cameraAccessoryFamily = /accesorio|accesorios/.test(familyText) && /cctv|camara|cámara|video/.test(familyText);
    const supportType = /mountcam|soporte(?:\s+(?:de|para))?\s+c[aá]mara|camera\s+(?:wall\s+)?mount|camera\s+bracket|bracket.*c[aá]mara|\bsoporte\b|\bbracket\b|\bmount\b/.test(typeText);
    const excluded = /junctionbox|caja|box|cable|fuente|power supply|alimentacion|alimentación|adaptador|adapter|inyector|switch|\bkit\b|dummy|carcasa|tapa|cover|disco|hdd/.test(typeText);
    return !excluded && (/(?:^|[-_])mountcam(?:[-_]|$)/.test(norm(p.name||'')) || (cameraAccessoryFamily && supportType));
  }

  function cameraSupportItems(model = buildModel()){
    return model.allItems.filter(isCameraSupportItem);
  }

  function isRelatedQuickGroup(quickGroup, family = currentFamily()){
    return quickGroup === 'Soportes' && familyQuickProfile(family) === 'cameras';
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

    if(profile === 'detectors'){
      const role = quickProductRole(item);
      const fire = !role.accessory && /fireprotect|detector(?:\s+de)?\s+(?:humo|incendio|calor|co)|smoke detector|heat detector|carbon monoxide/.test(typeText);
      const door = /doorprotect|door protect|contacto magn[eé]tico|magnetic contact|detector(?:\s+de)?\s+apertura/.test(typeText);
      const glass = /glassprotect|glass protect|rotura(?:\s+de)?\s+cristal|glass break/.test(typeText);
      const combi = /combiprotect|combi protect/.test(typeText);
      const motioncam = /motioncam|motion cam|curtaincam|curtain cam|detector de movimiento con imagen/.test(typeText);
      const phod = /\bphod\b|photo on demand|foto bajo demanda/.test(source);
      const curtain = /doublecurtain|curtainprotect|curtain protect|curtaincam|curtain cam|\bcurtain\b|\bcortina\b/.test(typeText);
      const outdoor = /outdoor|exterior/.test(`${typeText} ${featureText}`);
      const motion = /motionprotect|motion protect|detector(?:\s+de)?\s+movimiento|\bpir\b/.test(typeText);

      if(fire && !curtain) add('Incendio');
      if(motioncam) add('MotionCam');
      if(phod && motioncam) add('PhOD');
      if(combi){ add('Combi'); add('Movimiento'); add('Cristal'); }
      if(door && !fire) add('Apertura');
      if(glass && !fire) add('Cristal');
      if(motion && !fire) add('Movimiento');
      if(curtain && !fire) add('Cortina');
      if(outdoor && !fire) add('Exterior');
    }

    if(profile === 'smart_home'){
      const role = quickProductRole(item);
      const smartAccessory = role.accessory
        || /soporte rel[eé]|tapa.*caja|marco|frame|surfacebox|surface box|faceplate|panel|bypass/.test(typeText);

      if(smartAccessory){
        add('Accesorios');
      }else{
        const isRelay = /wallswitch|wall switch|\brelay\b|aj-relay|rel[eé]\s+(?:contacto|tension|tensión)|\brel[eé]s?\b/.test(typeText);
        const isOutlet = /outletcore|outlet core|socket|enchufe(?: ethernet| inteligente)?|\boutlet\b/.test(typeText);
        const isSwitch = /lightswitch|light switch|lightcore|light core|interruptor inteligente/.test(typeText);

        if(/doorbell|timbre|videoportero/.test(typeText)) add('Timbre');
        if(isRelay) add('Relés');
        if(isSwitch && !isRelay && !isOutlet) add('Interruptores');
        if(isOutlet) add('Enchufes');
        if(/waterstop|electrov[aá]lvula|\bvalve\b/.test(typeText)) add('Válvulas');
        if(/lifequality|monitor.*(?:temperatura|humedad|co2)|calidad.*aire/.test(typeText)) add('Clima / Aire');
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
      const secondaryRex = /modulo|módulo|alimentacion|alimentación|power supply|fuente|bracket|soporte|tapa|cover/.test(typeText);
      const repeater = /(?:^|\s)(rex\s*2|rex2|rex)(?:\s|$)|\brepetidor\b|\brepeater\b/.test(typeText) && !secondaryRex;
      const hubPlus = /hub\s*2\s*plus|hub2plus|hub plus|hubplus/.test(typeText);
      if(repeater) add('Repetidores');
      if(/hybrid/.test(typeText)) add('Hybrid');
      if(hubPlus) add('Hub Plus');
      if(/hub\s*2|hub2/.test(typeText)) add('Hub 2');
      else if(/\bhub\b/.test(typeText) && !/\bhubkit\b/.test(typeText)) add('Hub');
      if(/\bwi[ -]?fi\b|\bwlan\b/.test(featureText) || hubPlus) add('Wi‑Fi');
      if(/\b4g\b|\blte\b/.test(`${featureText} ${identity}`)) add('4G / LTE');
    }

    if(profile === 'wireless_accessories'){
      // En accesorios inalámbricos, identificar el producto principal por Tipo/subcategoría
      // y por el nombre corto del modelo. Nunca por la descripción larga.
      const name = norm(p.name || '');
      const structuredType = norm([
        item?.subcategory, p.product_type, p.tipo, p.series, p.technology
      ].filter(Boolean).join(' '));

      // Marcadores claros de que es un accesorio PARA el producto y no el producto.
      const secondaryName = /cover|tapa|bracket|soporte|holder|mount|carcasa|housing|adaptador|adapter|fuente|power|psu|alimentacion|alimentación|12v|24v/.test(name);
      const secondaryType = /tapa|cover|bracket|soporte|holder|mount|carcasa|housing|adaptador|adapter|fuente|power supply|alimentacion|alimentación/.test(structuredType);
      const secondary = secondaryName || secondaryType;

      const keypad = !secondary && (
        /\bteclado\b|\bkeypad\b/.test(structuredType) ||
        /(?:^|[-_])keypad(?:combi|plus|touchscreen|outdoor)?(?:[-_]|$)/.test(name) ||
        /keypadcombi|keypadplus|keypadtouchscreen/.test(name)
      );

      const siren = !secondary && (
        /\bsirena\b|\bsiren\b/.test(structuredType) ||
        /homesiren|streetsiren/.test(name)
      );

      const relay = !secondary && (
        /\brel[eé]\b|\brelay\b|contacto seco|tensi[oó]n/.test(structuredType) ||
        /(?:^|[-_])relay(?:[-_]|$)|wallswitch/.test(name)
      );

      const button = !secondary && (
        /\bbot[oó]n\b|\bmando\b|panic button|remote control/.test(structuredType) ||
        /doublebutton|spacecontrol|(?:^|[-_])button(?:[-_]|$)/.test(name)
      );

      const socket = !secondary && (
        /\benchufe\b|\bsocket\b/.test(structuredType) ||
        /(?:^|[-_])socket(?:[-_]|$)/.test(name)
      );

      const valve = !secondary && (
        /electrov[aá]lvula|\bv[aá]lvula\b|\bvalve\b/.test(structuredType) ||
        /waterstop/.test(name)
      );

      const repeater = !secondary && (
        /\brepetidor\b|\brepeater\b/.test(structuredType) ||
        /(?:^|[-_])rex2?(?:[-_]|$)/.test(name)
      );

      const lifeQuality = !secondary && (
        /lifequality|life quality|calidad.*aire|co2.*humedad|temperatura.*humedad/.test(structuredType) ||
        /lifequality/.test(name)
      );

      if(keypad) add('Teclados');
      if(siren) add('Sirenas');
      if(relay) add('Relés');
      if(button) add('Botones / Mandos');
      if(socket) add('Enchufes');
      if(valve) add('Válvulas');
      if(repeater) add('Repetidores');
      if(lifeQuality) add('LifeQuality');
    }

    return [...tags];
  }

  function quickAvailability(family = currentFamily(), model = buildModel()){
    const profile = familyQuickProfile(family);
    if(!profile || !family) return [];

    const order = QUICK_FILTER_ORDER[profile] || [];
    const available = new Set();

    // Related quicks (currently Soportes in cameras) are allowed to live outside
    // the family but their presence is stable for the session/catalog.
    if(profile === 'cameras' && cameraSupportItems(model).length) available.add('Soportes');

    family.items.forEach(item => {
      quickGroupsForItem(item, family).forEach(label => available.add(label));
    });

    // Only configured commercial labels are allowed to render.
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

    // Related camera supports are counted contextually too.
    if(profile === 'cameras' && counts.has('Soportes')){
      let supports = cameraSupportItems(model);
      if(clean(state.query)) supports = rankedSearch(supports, state.query);
      supports = applyFilters(supports, state.filters);
      counts.set('Soportes', supports.length);
    }

    return available.map(label => ({label, count:counts.get(label) || 0}));
  }

  function quickTypes(baseItems){
    const groups = quickGroups(baseItems);
    if(!groups.length) return '';

    return `<div class="hxp-type-strip" aria-label="Filtros rápidos">
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
    const priceText = typeof fmt?.format === 'function' ? fmt.format(price) : `${price.toFixed(2)} €`;
    return `<article class="hxp-product" data-index="${item.index}" data-ref="${esc(product.name)}" data-pvp="${price}">
      <div class="hxp-product-main">
        ${productImage(product)}
        <div class="hxp-product-copy">
          <strong class="hxp-product-ref">${esc(product.name || 'Sin referencia')}</strong>
          <span class="hxp-product-description">${esc(description)}</span>
          <div class="hxp-product-meta">${stockBadge(product)}${productMeta(product)}</div>
        </div>
      </div>
      <div class="hxp-product-commerce">
        <b class="hxp-price">${esc(priceText)}</b>
        <div class="hxp-product-actions">
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
          <span>${esc(family.displayTitle || family.familyTitle)}</span><em>${family.count}</em>
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
      <div class="hxp-products-layout">
        ${desktopFamilyRail(model)}
        <main class="hxp-main hxp-products-view">
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

  function render(options = {}){
    const root = byId('familiasGrid');
    if(!root) return;
    const active = document.activeElement;
    const restoreSearch = active?.id === 'hxpSearch';
    const selectionStart = restoreSearch ? active.selectionStart : null;
    const scroll = byId('hxpProductsScroll')?.scrollTop || 0;

    const showProducts = Boolean(state.familyKey || clean(state.query));
    state.view = showProducts ? 'products' : 'home';
    root.innerHTML = `<div class="hxp-app">${showProducts ? productsView() : homeView()}${drawerHtml()}</div>`;
    bind(root);

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
    requestAnimationFrame(() => byId('hxpProductsScroll')?.scrollTo({top:0}));
  }

  function goHome(){
    state.familyKey = '';
    state.query = '';
    state.filters = {};
    state.quickGroup = '';
    state.drawerOpen = false;
    state.sort = 'price-ref';
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
    if(ok && trigger){
      const original = trigger.textContent;
      trigger.textContent = 'Añadido';
      trigger.classList.add('is-added');
      setTimeout(() => { trigger.textContent = original; trigger.classList.remove('is-added'); }, 800);
    }
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
    scroller.scrollTop = 0;

    const count = document.querySelector('#familiasGrid .hxp-result-count');
    if(count) count.innerHTML = `<strong>${items.length}</strong> producto${items.length===1?'':'s'}`;

    // Los rápidos no se reconstruyen por cada letra. Se recalculan al aplicar filtros,
    // cambiar de familia o pulsar un rápido.
    bindDynamicResults(byId('familiasGrid'));
  }

  function bindDynamicResults(root){
    if(!root) return;
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
    root.querySelectorAll('.hx-product-thumb').forEach(button => {
      if(button.dataset.hxpBound) return;
      button.dataset.hxpBound='1';
      button.addEventListener('click', () => {
        if(typeof abrirImagenProducto === 'function') abrirImagenProducto(button.dataset.image);
      });
    });
  }

  function bind(root){
    const search = byId('hxpSearch');
    if(search){
      search.addEventListener('input', event => {
        state.query = event.target.value;
        clearTimeout(searchTimer);

        // Desde la portada, la primera letra abre resultados una sola vez.
        if(!byId('hxpProductsScroll')){
          if(clean(state.query)){
            render();
            requestAnimationFrame(() => {
              const next = byId('hxpSearch');
              next?.focus({preventScroll:true});
              if(next) next.setSelectionRange(next.value.length,next.value.length);
            });
          }
          return;
        }

        // Ya en resultados: solo actualiza la lista, nunca reconstruye el input.
        searchTimer = setTimeout(() => refreshSearchResults(), 90);
      });
      search.addEventListener('keydown', event => {
        if(event.key === 'Escape' && state.query){
          event.preventDefault();
          state.query = '';
          render();
        }
      });
    }

    root.querySelector('[data-hxp-clear-search]')?.addEventListener('click', () => {
      state.query = '';
      if(byId('hxpProductsScroll')) refreshSearchResults();
      else render();
      requestAnimationFrame(() => byId('hxpSearch')?.focus());
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

    root.querySelectorAll('[data-hxp-family]').forEach(button => button.addEventListener('click', () => selectFamily(button.dataset.hxpFamily)));
    root.querySelectorAll('[data-hxp-home]').forEach(button => button.addEventListener('click', goHome));
    root.querySelectorAll('[data-hxp-open-filters]').forEach(button => button.addEventListener('click', openFilters));
    root.querySelectorAll('[data-hxp-close-filters]').forEach(button => button.addEventListener('click', closeFilters));

    root.querySelector('#hxpSort')?.addEventListener('change', event => {
      state.sort = event.target.value;
      render({preserveScroll:false});
    });

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
      ref:item.p?.name,
      product_type:item.p?.product_type || '',
      subcategory:item.subcategory || '',
      families
    };
  };

  function openExplorer(){
    const modal = byId('familiasModal');
    if(!modal) return;
    state = freshState();
    drawerDraft = {};
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
      searchIndexSignature = '';
      searchIndexCache.clear();
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

  window.HX_EXPLORER_PRO = {
    open:openExplorer,
    close:closeExplorer,
    render,
    audit:auditProduct,
    auditFamilies,
    auditSearch,
    auditFilters,
    resetCache(){
      modelCache = null;
      modelSignature = '';
      searchIndexSignature = '';
      searchIndexCache.clear();
    },
    version:'6.1.1'
  };
})();
