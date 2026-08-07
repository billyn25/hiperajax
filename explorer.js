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
    { key:'subcategory', label:'Tipo de producto', order:10 },
    { key:'color', label:'Color', order:20 },
    { key:'stock_state', label:'Stock', order:30 },
    { key:'technology', label:'Tecnología', order:40 },
    { key:'protocol', label:'Protocolo', order:45 },
    { key:'connectivity', label:'Conectividad', order:50 },
    { key:'product_type', label:'Formato / tipo', order:55 },
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
  let searchTimer = null;
  let drawerDraft = {};
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
    return { category, family, subcategory:subcategory || 'Todos' };
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
      const shortNames = [
        [/^nvrs? profesionales$/i, 'NVRs'],
        [/^almacenamiento\s+nube$/i, 'Nube'],
        [/^almacenamiento\s+en\s+nube$/i, 'Nube'],
        [/^accesorios\s*[·-]\s*cctv$/i, 'Accesorios CCTV'],
        [/^accesorios\s*[·-]\s*inal[aá]mbrico$/i, 'Accesorios inalámbricos'],
        [/^kits\s*[·-]\s*cctv$/i, 'Kits CCTV'],
        [/^kits\s*[·-]\s*inal[aá]mbrico$/i, 'Kits inalámbricos']
      ];
      shortNames.some(([rx,label]) => rx.test(displayTitle) ? (displayTitle = label, true) : false);
      family.displayTitle = displayTitle;
      family.context = displayTitle === 'Otros productos' ? 'Productos añadidos manualmente'
        : (cleanCategory && norm(cleanCategory) !== norm(displayTitle) ? cleanCategory : '');
      family.representative = representativeProduct(family);
    });

    const displayCounts = new Map();
    families.forEach(family => displayCounts.set(slug(family.displayTitle), (displayCounts.get(slug(family.displayTitle)) || 0) + 1));
    families.forEach(family => {
      family.duplicateTitle = (displayCounts.get(slug(family.displayTitle)) || 0) > 1;
      if(family.duplicateTitle && family.context) family.displayTitle = `${family.displayTitle} · ${family.context}`;
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
    const map = [
      {rx:/\b(rele|reles|relé|relés|relay|wallswitch|wall switch)\b/, add:' relay wallswitch wall switch rele reles relé relés domotica smart home '},
      {rx:/\b(doorbell|timbre|videoportero)\b/, add:' doorbell timbre videoportero smart home '},
      {rx:/\b(phod|foto bajo demanda|fotosensor)\b/, add:' phod photo on demand foto bajo demanda motioncam fotosensor '},
      {rx:/\b(rex|repetidor|repetidores)\b/, add:' rex rex2 rex 2 repetidor repetidores '},
      {rx:/\b(4g|lte)\b/, add:' 4g lte gsm hub '},
      {rx:/\b(domo|dome)\b/, add:' domo dome camara '},
      {rx:/\b(turret)\b/, add:' turret camara '},
      {rx:/\b(bullet)\b/, add:' bullet camara '},
      {rx:/\b(combi|combiprotect)\b/, add:' combi combiprotect movimiento cristal '},
      {rx:/\b(cortina|curtain)\b/, add:' cortina curtain '},
      {rx:/\b(incendio|fire|humo)\b/, add:' incendio fire fireprotect humo smoke heat co '},
      {rx:/\b(lightcore|lightswitch|outletcore)\b/, add:' lightcore lightswitch outletcore smart home domotica '}
    ];
    return map.filter(entry => entry.rx.test(q)).map(entry => entry.add).join(' ');
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
      product.compatibility, attributes,
      searchAliases(`${product.name||''} ${product.short_description||''} ${product.description||''}`)
    ].filter(Boolean).join(' '));
  }

  function rankedSearch(items, query){
    const q = clean(query);
    if(!q) return items.slice();
    const allowed = new Set(items.map(item => item.index));
    const aliasQuery = searchAliases(q);
    try{
      if(q.length >= 3 && !aliasQuery && window.HXA_KNOWLEDGE_ENGINE?.rank){
        const indexed = currentProducts().map((product,index) => ({
          ...product,
          description:[
            product.description, product.short_description, product.category, product.family,
            product.subcategory, product.product_type, product.series, product.technology,
            product.color, product.connectivity, product.resolution,
            product.attributes && typeof product.attributes === 'object' ? Object.values(product.attributes).join(' ') : ''
          ].filter(Boolean).join(' '),
          _hxpIndex:index
        }));
        const ranked = window.HXA_KNOWLEDGE_ENGINE.rank(indexed, q, 500);
        const compactQuery = norm(q).replace(/[^a-z0-9]/g,'');
        const looksLikeReference = /[-_/.]/.test(q)
          || /^(?:aj|10xaj)[a-z0-9]/.test(compactQuery)
          || /^[a-z]{2,}\d{2,}[a-z0-9]*$/.test(compactQuery);
        const precise = looksLikeReference
          ? ranked.filter(product => norm(product?.name || '').replace(/[^a-z0-9]/g,'').includes(compactQuery))
          : ranked;
        return precise
          .map(product => modelItemByIndex(product._hxpIndex))
          .filter(item => item && allowed.has(item.index));
      }
    }catch(error){ console.warn('[Explorer Pro] búsqueda avanzada no disponible', error); }

    const needle = norm(q).replace(/\s+/g,' ');
    const expandedNeedle = norm(`${q} ${aliasQuery}`).replace(/\s+/g,' ').trim();
    const compactNeedle = needle.replace(/[^a-z0-9]/g,'');
    return items
      .map(item => {
        const haystack = productSearchText(item);
        const compact = haystack.replace(/[^a-z0-9]/g,'');
        let score = 0;
        const ref = norm(item.p?.name || '');
        if(ref === needle) score += 2000;
        if(ref.startsWith(needle)) score += 1200;
        if(ref.includes(needle)) score += 700;
        if(haystack.includes(needle)) score += 400;
        if(compactNeedle && compact.includes(compactNeedle)) score += 300;
        const tokens = expandedNeedle.split(/\s+/).filter(Boolean);
        score += tokens.reduce((total, token) => total + (haystack.includes(token) ? 90 : 0), 0);
        return { item, score };
      })
      .filter(result => result.score > 0)
      .sort((a,b) => b.score - a.score || collator.compare(a.item.p?.name || '', b.item.p?.name || ''))
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

  function buildFacets(items){
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
      if(values.length < 2) return;
      if(!isCore && values.length > 30) return;
      groups.push({
        key,
        label:prettifyKey(key),
        order:KNOWN_FACET_MAP.get(key)?.order ?? 500,
        values
      });
    });
    return groups.sort((a,b) => a.order - b.order || collator.compare(a.label,b.label));
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
    if(/smart home|smarthome|domotica|domótica|automatizacion|automatización|confort/.test(text)) return 'type-ref-color';
    if(/camara|cámara|camaras|cámaras|nvr|grabador|detect|central|hub|sirena|teclado/.test(text)) return 'ref-color';
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

  function resultItems(filters = state.filters){
    const model = buildModel();
    let items = state.familyKey ? familyItems(model) : model.allItems.slice();
    if(clean(state.query)) items = rankedSearch(items, state.query);
    if(state.quickGroup){
      const family = currentFamily(model);
      items = items.filter(item => quickGroupForItem(item, family) === state.quickGroup);
    }
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
      const wdPrimary = 'https://www.westerndigital.com/content/dam/store/en-us/assets/products/internal-storage/wd-purple-sata-hdd/featured/WD-Purple-feature1.jpg.wdthumb.319.319.jpg';
      const wdFallback = 'https://thumb.pccomponentes.com/w-530-530/articles/1100/11000748/1772-disco-duro-western-digital-purple-1tb-35-hdd-5400rpm-sata-iii-vigilancia.jpg';
      return `<span class="hxp-family-visual hxp-family-visual-image"><img src="${wdPrimary}" data-fallback="${wdFallback}" alt="Disco duro Western Digital Purple" loading="lazy" onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.dataset.fallback=''}else{this.closest('.hxp-family-visual').classList.add('is-error')}"><b>O</b></span>`;
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


  function quickGroupForItem(item, family){
    const p = item?.p || {};
    const familyText = norm(`${family?.displayTitle||''} ${family?.familyTitle||''} ${family?.categoryTitle||''}`);
    const text = norm(`${item?.subcategory||''} ${p.name||''} ${p.short_description||''} ${p.description||''} ${p.product_type||''} ${p.series||''}`);

    if(/camara|cámara/.test(familyText)){
      if(/\bptz\b/.test(text)) return 'PTZ';
      if(/\bcube\b|\bcubo\b/.test(text)) return 'Cube';
      if(/\bturret\b/.test(text)) return 'Turret';
      if(/\bbullet\b/.test(text)) return 'Bullet';
      if(/\bdome\b|\bdomo\b/.test(text)) return 'Domo';
      return 'Otros';
    }

    if(/detector|detectores|intrusion|intrusión/.test(familyText)){
      if(/fireprotect|incendio|humo|smoke|heat|temperatura|carbon monoxide|\bco\b/.test(text)) return 'Incendio';
      if(/phod|foto bajo demanda|photo on demand|photo by demand/.test(text)) return 'PhOD';
      if(/combi/.test(text)) return 'Combi';
      if(/motioncam|motion cam|verificacion fotografica|verificación fotográfica/.test(text)) return 'MotionCam';
      if(/curtain|cortina/.test(text)) return 'Cortina';
      if(/outdoor|exterior/.test(text)) return 'Exterior';
      if(/glass|cristal|rotura/.test(text)) return 'Cristal';
      if(/door|apertura|contacto magnetico|contacto magnético/.test(text)) return 'Apertura';
      if(/motion|movimiento/.test(text)) return 'Movimiento';
      return 'Otros';
    }

    if(/smart home|smarthome|domotica|domótica|automatizacion|automatización|confort/.test(familyText)){
      if(/doorbell|timbre|videoportero/.test(text)) return 'DoorBell';
      if(/wallswitch|wall switch|\brelay\b|aj-relay|\brele\b|relé|reles|relés/.test(text)) return 'Relés';
      if(/lightcore/.test(text)) return 'LightCore';
      if(/lightswitch/.test(text)) return 'LightSwitch';
      if(/outletcore/.test(text)) return 'OutletCore';
      if(/socket|enchufe|outlet/.test(text)) return 'Enchufes';
      return 'Otros';
    }

    if(/\bnvr\b|grabador|grabacion|grabación/.test(familyText)){
      const ch = text.match(/\b(4|8|16|32|64)\s*(?:ch|canales?)\b/);
      if(ch) return `${ch[1]} canales`;
      return 'Otros';
    }

    if(/central|centrales|hub|hubs/.test(familyText)){
      if(/\brex\b|\brex2\b|repetidor|repeater/.test(text)) return 'Repetidores';
      if(/hybrid/.test(text)) return 'Hybrid';
      if(/hub\s*2|hub2/.test(text) && /4g|lte/.test(text)) return '4G / LTE';
      if(/hub plus|hubplus/.test(text)) return 'Hub Plus';
      if(/hub\s*2|hub2/.test(text)) return 'Hub 2';
      if(/\bhub\b/.test(text)) return 'Hub';
      return 'Otros';
    }

    return '';
  }

  function quickGroups(baseItems){
    const family = currentFamily();
    const counts = new Map();
    baseItems.forEach(item => {
      const label = quickGroupForItem(item, family);
      if(label) counts.set(label, (counts.get(label) || 0) + 1);
    });
    const preferred = {
      'camaras ip':['Bullet','Turret','Domo','Cube','PTZ','Otros'],
      'detectores':['Movimiento','Apertura','MotionCam','PhOD','Cristal','Combi','Exterior','Cortina','Incendio','Otros'],
      'smart home':['LightSwitch','LightCore','OutletCore','Relés','Enchufes','DoorBell','Otros'],
      'centrales':['Hub','Hub 2','4G / LTE','Hub Plus','Hybrid','Repetidores','Otros']
    };
    const ft = norm(`${family?.displayTitle||''} ${family?.familyTitle||''}`);
    let order = [];
    for(const [key,values] of Object.entries(preferred)){
      if(ft.includes(norm(key))) { order = values; break; }
    }
    const labels = [...counts.keys()].filter(label => counts.get(label) > 0);
    labels.sort((a,b) => {
      const ai = order.indexOf(a), bi = order.indexOf(b);
      if(ai >= 0 || bi >= 0) return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
      return collator.compare(a,b);
    });
    return labels.map(label => ({label,count:counts.get(label)}));
  }

  function quickTypes(baseItems){
    const groups = quickGroups(baseItems).filter(group => group.label !== 'Otros');
    if(groups.length < 2) return '';
    const top = groups.slice(0, isMobile() ? 8 : 10);
    const hidden = groups.length - top.length;
    return `<div class="hxp-type-strip" aria-label="Filtros rápidos">
      <button type="button" class="hxp-type-tab ${!state.quickGroup?'is-active':''}" data-hxp-quick="">Todos</button>
      ${top.map(group => `<button type="button" class="hxp-type-tab ${state.quickGroup===group.label?'is-active':''}" data-hxp-quick="${esc(group.label)}"><span>${esc(group.label)}</span><em>${group.count}</em></button>`).join('')}
      ${hidden>0 ? `<button type="button" class="hxp-type-more" data-hxp-open-filters>Más <b>+${hidden}</b></button>` : ''}
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

  function productsView(){
    const model = buildModel();
    const family = currentFamily(model);
    const baseItems = family ? family.items.slice() : model.allItems.slice();
    const items = resultItems();
    const title = family?.familyTitle || 'Resultados';
    const context = family?.context || (state.query ? 'Búsqueda en todo el catálogo' : 'Todos los productos');
    return `${toolbar(items.length)}
      <main class="hxp-main hxp-products-view">
        <div class="hxp-current-family">
          <button type="button" class="hxp-back" data-hxp-home aria-label="Volver a familias">${svgIcon('back')}</button>
          <div><h3>${esc(title)}</h3><p>${esc(context)}</p></div>
          ${state.familyKey ? `<button type="button" class="hxp-change-family" data-hxp-home>Cambiar familia</button>` : ''}
        </div>
        ${state.familyKey ? quickTypes(quickCounterItems()) : ''}
        <div class="hxp-products-scroll" id="hxpProductsScroll">
          ${items.map(productCard).join('') || `<div class="hxp-empty hxp-empty-products"><strong>No hay productos con estos filtros.</strong><button type="button" data-hxp-clear-filters>Limpiar filtros</button></div>`}
        </div>
      </main>`;
  }

  function selectedFilterSummary(filters){
    const count = activeFilterCount(filters);
    return count ? `${count} filtro${count===1?'':'s'} activo${count===1?'':'s'}` : 'Sin filtros activos';
  }

  function drawerHtml(){
    if(!state.drawerOpen) return '';
    const base = state.familyKey ? familyItems() : buildModel().allItems.slice();
    const facets = buildFacets(base);
    const previewCount = resultItems(drawerDraft).length;
    const groups = facets.map((group,index) => {
      const selected = drawerDraft[group.key] || [];
      const defaultOpen = selected.length || (isMobile() ? index < 2 : index < 4);
      return `<details class="hxp-filter-group" ${defaultOpen ? 'open' : ''}>
        <summary><span>${esc(group.label)}</span><em>${selected.length || group.values.length}</em></summary>
        <div class="hxp-filter-options">
          ${group.values.map(value => `<label class="hxp-filter-option">
            <input type="checkbox" data-hxp-facet="${esc(group.key)}" value="${esc(value.id)}" ${selected.includes(value.id)?'checked':''}>
            <span>${esc(value.title)}</span><em>${value.count}</em>
          </label>`).join('')}
        </div>
      </details>`;
    }).join('');

    return `<div class="hxp-drawer-layer" data-hxp-drawer-layer>
      <button type="button" class="hxp-drawer-backdrop" data-hxp-close-filters aria-label="Cerrar filtros"></button>
      <aside class="hxp-drawer" role="dialog" aria-modal="true" aria-labelledby="hxpFiltersTitle">
        <header class="hxp-drawer-head">
          <div><h3 id="hxpFiltersTitle">Filtros</h3><p id="hxpFilterSummary">${esc(selectedFilterSummary(drawerDraft))}</p></div>
          <button type="button" class="hxp-drawer-close" data-hxp-close-filters aria-label="Cerrar filtros">${svgIcon('close')}</button>
        </header>
        <div class="hxp-drawer-body">
          ${groups || '<div class="hxp-empty">No hay filtros adicionales para esta selección.</div>'}
        </div>
        <footer class="hxp-drawer-foot">
          <button type="button" class="hxp-filter-clear" data-hxp-draft-clear>Limpiar</button>
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
    const count = resultItems(drawerDraft).length;
    const apply = root.querySelector('[data-hxp-apply]');
    if(apply) apply.textContent = `Ver ${count} producto${count===1?'':'s'}`;
    const summary = root.querySelector('#hxpFilterSummary');
    if(summary) summary.textContent = selectedFilterSummary(drawerDraft);
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

  function bind(root){
    const search = byId('hxpSearch');
    if(search){
      search.addEventListener('input', event => {
        state.query = event.target.value;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          const value = state.query;
          render();
          requestAnimationFrame(() => {
            const next = byId('hxpSearch');
            if(next && document.activeElement !== next){
              next.focus({preventScroll:true});
              next.setSelectionRange(value.length,value.length);
            }
          });
        }, 170);
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
      render();
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
      state.quickGroup = button.dataset.hxpQuick || '';
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
      root.querySelectorAll('[data-hxp-facet]').forEach(input => { input.checked = false; });
      updateDrawerPreview(root);
    });

    root.querySelector('[data-hxp-apply]')?.addEventListener('click', () => {
      state.filters = JSON.parse(JSON.stringify(drawerDraft));
      state.drawerOpen = false;
      render();
    });

    root.querySelector('[data-hxp-clear-filters]')?.addEventListener('click', () => {
      state.filters = {};
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
      const modal = byId('familiasModal');
      if(modal && !modal.classList.contains('hidden')) render();
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();

  window.abrirFamilias = openExplorer;
  window.renderFamilias = render;
  window.HX_EXPLORER_PRO = {
    open:openExplorer,
    close:closeExplorer,
    render,
    resetCache(){ modelCache = null; modelSignature = ''; },
    version:'5.0.1'
  };
})();
