'use strict';

var m = require('mithril');

var view = function(){
	return m('h1', 'A first page with Mithril');
};

m.mount(document.getElementById('app'), { view: view });