/**
 * User friendly infinity scroll
 * Author: @snake_345
 * Licensed under the MIT license
 */

;(function ($, window, document) {
	'use strict';

	var pluginName = 'ufiScroll';
	var	defaults = {
		url: window.location.pathname +
			 window.location.search +
			 (window.location.search ? '&page={number}' : '?page={number}') +
			 window.location.hash,
		pageCount: null,
		preloader: '<div class="preloader">Loading...</div>',
		selectors: {
			itemFirst: '.ufi-item-first',
			itemLast: '.ufi-item-last'
		}
	};

	function Ufi($element, options) {
		var pageRegExp;
		var data = $element.data();
		this.$element = $element;
		this.options = $.extend({}, defaults, data, options);
		this.$preloader = $(this.options.preloader);

		pageRegExp = new RegExp(this.options.url.replace('{number}', '(\\d+)'), 'i');
		this.currentPage = window.location.search.match(pageRegExp) ? window.location.search.match(pageRegExp) : 1;
		this.lastLoadedPage = this.currentPage;
		this.isLoading = false;

		console.log(this.options.pageCount);

		this.init();
	}

	Ufi.prototype = {
		init: function() {
			this._pageItemsEnhancment(this.$element, this.currentPage);
			this._scrollInit();
		},

		_scrollInit: function() {
			var _scrollHandler = this._delayFunctionCall(1, 50, this._scrollHandler);
			$(window).on('scroll.ufi', function() {
				_scrollHandler();
			});
		},

		_scrollHandler: function() {
			if (this.lastLoadedPage < this.options.pageCount) {
				var scrollBottom = $(window).scrollTop() + $(window).height();
				var lastLoadedPagePosition = this._getPagePosition(this.lastLoadedPage);
				var prediction = (lastLoadedPagePosition.bottom - lastLoadedPagePosition.top) * 0.25;

				if ( scrollBottom >= lastLoadedPagePosition.bottom - prediction) {
					this._loadPage(this.currentPage + 1);
				}
			}
		},

		_loadPage: function(page) {
			var self = this;
			if (!this.isLoading) {
				this.isLoading = true;
				this._showPreloader();
				$.ajax({
					url: this.options.url.replace('{number}', page),
					success: function(html) {
						var $content = $(html).find(self.$element.selector);

						if (!$content.length) {
							$content = $(html);
						}

						self._pageItemsEnhancment($content, page);
						self.currentPage = page;
						self.$element.append($content.find('.item'));
						self.lastLoadedPage = page;
						self._hidePreloader();
						self.isLoading = false;
					}
				})
			}
		},

		_showPreloader: function() {
			this.$element.append(this.$preloader);
		},

		_hidePreloader: function() {
			this.$preloader.remove();
		},

		_calculatePageHeight: function(page) {
			var pagePosition = this._getPagePosition(page);

			return pagePosition.bottom - pagePosition.top;
		},

		_getPagePosition: function(page) {
			var $itemLast = this._getLastItemOnPage(page);

			return {
				top: this._getFirstItemOnPage(page).offset().top,
				bottom: $itemLast.offset().top + $itemLast.outerHeight()
			}
		},

		_getVisiblePage: function() {

		},

		_getFirstItemOnPage: function(page) {
			return this.$element.find(this.options.selectors.itemFirst + '[data-page="' + page + '"]');
		},

		_getLastItemOnPage: function(page) {
			return this.$element.find(this.options.selectors.itemLast + '[data-page="' + page + '"]');
		},

		_pageItemsEnhancment: function($element, page) {
			$element.find('> *:first')
				.addClass(this.options.selectors.itemFirst.slice(1))
				.attr('data-page', page);
			$element.find('> *:last')
				.addClass(this.options.selectors.itemLast.slice(1))
				.attr('data-page', page);
		},

		_delayFunctionCall: function(times, interval, func) {
			var callCount = 0;
			var startTime = (new Date()).getTime();
			var timeout;
			var self = this;
			if (typeof func !== 'function') return false;
			times = times || 1;
			interval = interval || 50;

			return function() {
				var callTime = (new Date()).getTime();
				var args = arguments;

				if (callTime - startTime > interval) {
					callCount = 0;
					startTime = callTime;
				}

				clearTimeout(timeout);
				timeout = setTimeout(function() {
					func.apply(self, args);
					startTime = (new Date()).getTime();
				}, interval - (callTime - startTime));

				if (callCount < times) {
					callCount++;
					clearTimeout(timeout);
					return func.apply(self, args);
				}
			};
		}
	};

	$.fn[pluginName] = function ( options ) {
		var $element = this.first();
		$element.selector = this.selector + ':first';
		if (!$.data($element, pluginName)) {
			$.data($element, pluginName,
				new Ufi($element, options));
		}
		return this;
	};

})(jQuery, window, document);
