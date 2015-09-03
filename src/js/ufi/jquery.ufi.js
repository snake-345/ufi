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
		},
		pagination: function(current) {
			var $pagination = $('<div class="ufi-pagination"/>');
			var $page = $('<a href="#" class="ufi-pagination_page"/>');
			var $separator = $('<span class="ufi-pagination_separator">...</span>');
			var paginationRaw = this.generatePagination(current, this.options.pageCount, 3, 1, 1);
			var $tempEl;

			for (var i = 0; i < paginationRaw.length; i++) {
				if (typeof paginationRaw[i] !== 'string') {
					$tempEl = $page.clone();
					$tempEl.text(paginationRaw[i]);
					if (paginationRaw[i].isActive) {
						$tempEl.addClass('_active');
					}
				} else {
					$tempEl = $separator.clone();
				}

				$pagination.append($tempEl);
			}

			if ($('body').find('.ufi-pagination').length) {
				$('body').find('.ufi-pagination').replaceWith($pagination);
			} else {
				$('body').append($pagination);
			}
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

		this.init();
	}

	Ufi.prototype = {
		init: function() {
			this._pageItemsEnhancment(this.$element, this.currentPage);
			this._scrollInit();
			this.options.pagination.call(this, this.currentPage);
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
						self.options.pagination.call(self, self.currentPage);
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
		},

		generatePagination: function(currentPage, countPages, pages, firstPages, lastPages) {
			firstPages = firstPages || 0;
			lastPages = lastPages || 0;
			var ranges = [];
			var result = [];
			var firstHidedPages = firstPages ? 2 : 0;
			var lastHidedPages = lastPages ? 2 : 0;
			var minimumPages = pages + firstPages + lastPages + firstHidedPages / 2 + lastHidedPages / 2;
			var beforeCurrentPage = Math.ceil((pages - 1) / 2);
			var afterCurrentPage = pages - 1 - beforeCurrentPage;
			var isFirstEnhancment = false;
			var isLastEnhancment = false;
			var number, i;

			if (countPages <= minimumPages) {
				ranges.push({
					from: 1,
					to: countPages
				});
			} else {
				isFirstEnhancment = currentPage <= firstPages + firstHidedPages + beforeCurrentPage;
				isLastEnhancment = currentPage + afterCurrentPage + lastPages + lastHidedPages > countPages;

				if (isFirstEnhancment) {
					ranges.push({
						from: 1,
						to: firstPages + firstHidedPages + beforeCurrentPage + afterCurrentPage
					});
				} else {
					ranges.push({
						from: 1,
						to: firstPages
					});
					if (firstHidedPages) {
						ranges.push('...');
					}
					if (!isLastEnhancment) {
						ranges.push({
							from: currentPage - beforeCurrentPage,
							to: currentPage
						});
					}
				}

				if (isLastEnhancment) {
					ranges.push({
						from: countPages + 1 - afterCurrentPage - beforeCurrentPage - lastPages - lastHidedPages,
						to: countPages
					});
				} else {
					if (!isFirstEnhancment) {
						ranges.push({
							from: currentPage + 1,
							to: currentPage + afterCurrentPage
						});
					}
					if (lastHidedPages) {
						ranges.push('...');
					}
					ranges.push({
						from: countPages - lastPages + 1,
						to: countPages
					});
				}
			}

			for (i = 0; i < ranges.length; i++) {
				if (ranges[i].from) { // кря
					for (var j = ranges[i].from; j <= ranges[i].to; j++) {
						number = new Number(j);
						if (j === currentPage) {
							number.isActive = true;
						}
						result.push(number);
					}
				} else {
					result.push(ranges[i]);
				}
			}
			return result;
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