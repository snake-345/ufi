/**
 * User friendly infinity scroll
 * Author: @snake_345
 * Licensed under the MIT license
 */

;(function ($, window, document) {
	'use strict';

	var pluginName = 'ufiScroll';
	var	defaults = {
		ajaxUrl: {
			base: window.location.pathname,
			segment: null,
			pageMask: 'page={number}'
		},
		paginationType: 'pagenumbers',
		pageCount: null,

		preloaderImage: 'images/preloader.gif',
		preloaderHtml: null,

		loadType: 'auto',
		selectors: {
			page: '.page',
			pagination: '.pagination',
			preloader: '.preloader',
			progressbar: '.progressbar'
		}
	};

	function Ufi(element, options) {
		var pageRegExp;
		this.element = element;
		this.$element = $(element);
		this.options = $.extend({}, defaults, options);

		pageRegExp = new RegExp(this.options.ajaxUrl.pageMask.replace('{number}', '(\\d+)'), 'i');
		this.currentPage = window.location.search.match(pageRegExp) ? window.location.search.match(pageRegExp) : 1;
		this.lastPage = this.currentPage;


		this.init();
	}

	Plugin.prototype = {

		init: function() {
			this.scrollInit();
		}
	};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, pluginName)) {
				$.data(this, pluginName,
				new Plugin( this, options ));
			}
		});
	};

})(jQuery, window, document);