/*
 * OnePageScroll - npm package
 *
 * ===================================================================
 * onepagescroll.js v1.0.1
 * Athuor : scher200
 * Fork this script on github https://github.com/scher200/onepagescroll
 *
 * ===================================================================
 * This was forked from:
 *
 * onepagescroll.js v1.0.0
 * Athuor : Mystika
 * Fork this script on github https://github.com/mystika/onepagescroll
 * http://mystika.me
 *
 * ===================================================================
 */

function onepagescroll(selector = false, options) {

  // global
  var selectedElem;
  var pages = [];
  var currentPage = 1;
  var isPageChanging = false;
  var keyUp = {
    38: 1,
    33: 1
  };
  var keyDown = {
    40: 1,
    34: 1
  };
  // swipe
  var fpos = 0;
  var lpos = 0;
  var _n = 90;
  // onepagescroll defaults
  var def = {
    pageContainer: 'section',
    animationType: 'ease-in-out',
    animationTime: 500,
    infinite: false,
    pagination: true,
    keyboard: true,
    direction: 'vertical',
  };
  // wheel even trigger
  wheelEventTrigger = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
              document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
              "DOMMouseScroll";


  var setting = extend({}, def, options);

  // initialization
  function init() {
    // bind touch catching
    document.addEventListener('touchstart', touchStartOnePageScroll);
    document.addEventListener('touchend', touchEndOnePageScroll);
    window.addEventListener(wheelEventTrigger, onScrollEventHandler);

    // set transitions - selectedElem isset beneeth in parent scope
    css(selectedElem, {
      transition: 'transform ' + setting.animationTime + 'ms ' + setting.animationType
    });

    // allow keyboard input
    if ( setting.keyboard ) {
      addEventListener('keydown', function(e) {
        if (keyUp[e.keyCode])
          changePage(1, pages.length, -1);
        else if (keyDown[e.keyCode])
          changePage(pages.length, 1, 1);
      });
    }

    // set page bullets navigation
    document.querySelector(selector).classList.add('ops-container');

    detectTransitionEnd() && document.querySelector(selector).addEventListener(detectTransitionEnd(), function() {
      isPageChanging = false;
    });

    var bullet_list_container = null;
    // create navigation bullets
    if (setting.pagination) {
      bullet_list_container = document.createElement("ul");
      bullet_list_container.classList.add('ops-navigation');
    }

    var index = 1;
    [].forEach.call(document.querySelectorAll(selector + ' > ' + setting.pageContainer), function(obj) {
      if (setting.pagination) {
        var bullet_list = document.createElement('li');
        var bullet = document.createElement('a');
        bullet.setAttribute('data-targetindex', index);
        bullet.addEventListener('click', function(){ 
          changePage(false, pages.length, parseInt(this.getAttribute('data-targetindex')) );
        });
        bullet_list.appendChild(bullet);
        bullet_list_container.appendChild(bullet_list);
      }

      obj.classList.add('ops-page');

      if (setting.direction == 'horizontal') {
        css(obj, {
          left: (index - 1) * 100 + '%',
          position: 'absolute'
        });
      }


      pages.push(obj);
      obj.setAttribute('data-pageindex', index++);
    });

    if (setting.pagination) {
      document.body.appendChild(bullet_list_container);
      document.querySelector('a[data-targetindex="' + currentPage + '"]').classList.add('active');
    }

    console.log("onePageScroll: initialized");

    return true;

  }

  // reinitalize
  function reinit() {

    return deinit() && init();

  }

  // deinitialize onepagescroll from the page
  function deinit() {

	var opsNavElem = document.querySelector('.ops-navigation');

    // remove page bullets naviagation and eventlisteners
    if ( opsNavElem !== null ) {

      document.removeEventListener('touchstart', touchStartOnePageScroll);
      document.removeEventListener('touchend', touchEndOnePageScroll);
      window.removeEventListener(wheelEventTrigger, onScrollEventHandler);

      var opsContainerElem = document.querySelector('.ops-container');
      if( opsContainerElem !== null ){
        opsContainerElem.classList.remove('ops-container');
      }

      // Remove all of them.
      var selectTag = document.getElementsByClassName('ops-navigation');
      while( selectTag[0] ) {
          selectTag[0].parentNode.removeChild( selectTag[0] );
      }

      // if( typeof opsNavElem.parentNode !== 'undefined' ){
      //   opsNavElem.parentNode.removeChild(opsNavElem);
      // }

      console.log("onePageScroll: deinitialized");

    }

    return true;

  }

  // catch touch begin position
  function touchEndOnePageScroll(e) {
    e.preventDefault();
    if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
      var touch = e.touches[0] || e.changedTouches[0];
      if (setting.direction == 'vertical')
        lpos = touch.pageY;
      else if (setting.direction == 'horizontal')
        lpos = touch.pageX;
    }
    if (fpos + _n < lpos)
      changePage(1, pages.length, -1);
    else if (fpos > lpos + _n)
      changePage(pages.length, 1, 1);
  }

  // catch touch end position
  function touchStartOnePageScroll(e) {
    e.preventDefault();
    if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
      var touch = e.touches[0] || e.changedTouches[0];
      if (setting.direction == 'vertical')
        fpos = touch.pageY;
      else if (setting.direction == 'horizontal')
        fpos = touch.pageX;
    }
  }

  // wheel event handler
  function onScrollEventHandler(e) {
    if (e.wheelDelta > 0)
      changePage(1, pages.length, -1);
    else
      changePage(pages.length, 1, 1);
  }

  // dected transitions completion for block duplicated scrolling
  function detectTransitionEnd() {
    var t;
    var el = document.createElement('fakeelement');
    var transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    }

    for (t in transitions)
      if (el.style[t] !== undefined)
        return transitions[t];
    return true;
  }

  // css setter
  function css(obj, styles) {
    for (var _style in styles)
      if (obj.style[_style] !== undefined)
        obj.style[_style] = styles[_style];

  }

  // extend function for user customization
  function extend() {
    for (var i = 1; i < arguments.length; i++)
      for (var key in arguments[i])
        if (arguments[i].hasOwnProperty(key))
          arguments[0][key] = arguments[i][key];
    return arguments[0];
  }

  // page transition function
  function changePage(compare, edge, increase) {

    if (isPageChanging) return;

    if (currentPage == compare) {
      if (setting.infinite)
        currentPage = edge;
      else
        return;
    } else {
      if( compare == false ){
        if( currentPage == increase )
          return;
        else
          currentPage = increase;
      }else{
        currentPage += increase;
      }
    }

    if (setting.animationTime) isPageChanging = true;

    if (setting.pagination) {
      document.querySelector('a.active[data-targetindex]').classList.remove('active');
      document.querySelector('a[data-targetindex="' + currentPage + '"]').classList.add('active');
    }
    if (setting.direction == 'vertical') {
      css(document.querySelector(selector), {
        transform: 'translate3d(0,' + -(currentPage - 1) * 100 + '%,0)',
        width: window.innerWidth + 'px',
        height: window.innerHeight + 'px'
      });
    } else if (setting.direction == 'horizontal') {
      css(document.querySelector(selector), {
        transform: 'translate3d(' + -(currentPage - 1) * 100 + '%,0,0)',
        width: window.innerWidth + 'px',
        height: window.innerHeight + 'px'
      });
    }
  }

  // prepare onepagescroll if it would work on this page
  function main(){
    if ( (!selector || selector == def.pageContainer) && document.querySelector(def.pageContainer) ) {
      document.querySelector(def.pageContainer).parentElement.className += " pageContainerParent";
      selector = ".pageContainerParent";
    }

    selectedElem = document.querySelector(selector);

    if ( selectedElem == null ) {

      // if no onepagescroll sections found then deinitalize
      console.log("onePageScroll: deinit");
      return deinit();

    } else if ( document.querySelector('.ops-navigation') ) {

      // if onepagescroll exists and is already initialized reinitialize it
      console.log("onePageScroll: reinit");
      return reinit();

    } else {

      // if possible and not yet initialized then initialize
      console.log("onePageScroll: init");
      return init();

    }

	  // something impossible happend
    console.log("onePageScroll: Error");
	  return false;

  }

  // time to run onepagescroll or directly run it
  if ( document.readyState === 'complete' ) {
    return main();
  } else {
    window.addEventListener('load', function(){ setTimeout(main, 200) }, false);
  }

}
