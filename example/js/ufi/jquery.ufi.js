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
		this.pages = [];

		this.init();
	}

	Ufi.prototype = {
		init: function() {
			this._pageItemsEnhancment(this.$element, this.currentPage);
			this.pages[this.lastLoadedPage] = this._getPagePosition(this.lastLoadedPage);
			this._scrollInit();
			this.options.pagination.call(this, this.currentPage);
		},

		_scrollInit: function() {
			var _scrollHandler = this._delayFunctionCall(1, 50, this._scrollHandler);

			/***********************
			 * Временное решение
			 ***********************/
			// TODO: дописать подгрузку нужного количества страниц
			var self = this;
			this._loadPage(2);

			setTimeout(function() {
				self._loadPage(3);
			}, 300);
			setTimeout(function() {
				self._loadPage(4);
			}, 600);
			setTimeout(function() {
				self._loadPage(5);
			}, 900);
			/***********************
			 * Временное решение
			 ***********************/

			$(window).on('scroll.ufi', function() {
				_scrollHandler();
			});
		},

		_scrollHandler: function() {
			var scrollTop = $(window).scrollTop();
			var winHeight = $(window).height();
			var scrollBottom = scrollTop + winHeight;
			var lastLoadedPagePosition = this.pages[this.lastLoadedPage];
			var prediction = (lastLoadedPagePosition.bottom - lastLoadedPagePosition.top) * 0.25;

			scrollTop = this._improveScrollTop(scrollTop);

			if (this.lastLoadedPage < this.options.pageCount) {
				if (scrollBottom >= lastLoadedPagePosition.bottom - prediction) {
					this._loadPage(this.lastLoadedPage + 1);
				}
			}

			if (this.currentPage !== this._getVisiblePage(scrollTop)) {
				this.currentPage = this._getVisiblePage(scrollTop);
				this.options.pagination.call(this, this.currentPage);
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
						setTimeout(function() {
							self.pages[page] = self._getPagePosition(page);
						}, 0);
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

		_improveScrollTop: function(scrollTop) {
			// Последние страницы, могут быть слишком маленькими по высоте и тогда их верхняя граница
			// никогда не пересекёт scrollTop, таким образом нет возможности определить,
			// что они уже видимы и соответсвующе перестроить пагинацию.
			// Тоесть у пагинации не будет возможности определить последнии страницы и они никогда не станут активными.
			// Для борьбы с этой проблемой в данной функции реализовано следующее решение:
			//   - Получаем номер последней страницы верхняя граница которой меньше максимального scrollTop
			//   - расчитываем сколько мы ещё можем прокуртить после этой страницы
			//   - если прокрутить можно меньше чем 300 пикселей, двигаем верхнюю границу найденной страницы так, чтобы после
			//     определения, что это активная страница, можно было прокрутить ещё 300 пикселей
			//   - увеличиваем scrollTop относительно прокрученного остатка
			//   - таким образом добиваемся что мнимый scrollTop пересекет верхние границы всех страниц
			if (this.lastLoadedPage === this.options.pageCount) { // Если последняя страница загружена
				var lastPageFit = this._getLastPageFit();                       // последняя страница top которой меньше максимального scrollTop
				if (lastPageFit === this.options.pageCount) return scrollTop;   // если это самая последняя страница, то модифицировать scrollTop нет необходимости
				var lastPageFitTop = this.pages[lastPageFit].top;
				var docHeight = document.documentElement.scrollHeight;
				var winHeight = document.documentElement.clientHeight;
				var remainder = docHeight - (lastPageFitTop + winHeight); // сколько ещё будет возможно прокрутить после верхней границы lastPageFit

				// Когда остаток слишком мал, последние страницы слишком быстро переключаются, поэтому
				if (remainder < 300) {                      // если остаток меньше 300, то
					lastPageFitTop -= 300 - remainder;      // двигаем верхнюю границу последней вмещающейся страницы на разницу между 300 и текущим остатком
					remainder = 300;                        // устанавливаем значение остатка в 300;
				}

				// увеличиваем scrollTop относительно того, сколько из пощитанного нами остатка уже прокрутили
				var modificator = winHeight * ((scrollTop - lastPageFitTop) / remainder);

				if (scrollTop > lastPageFitTop) {
					scrollTop += modificator;
				}
			}

			return scrollTop;
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

		_getLastPageFit: function() {
			for (var i = this.pages.length - 1; i > 0; i--) {
				if (document.documentElement.scrollHeight - this.pages[i].top > document.documentElement.clientHeight) {
					break;
				}
			}

			return i;
		},

		_getVisiblePage: function(scrollTop) {
			for (var i = this.pages.length - 1; i > 0; i--) {
				if (scrollTop >= this.pages[i].top && scrollTop <= this.pages[i].bottom) {
					return i;
				}
			}

			return this.currentPage;
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
			pages = pages || 1;
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
						to: Math.max(firstPages, 1) + firstHidedPages + beforeCurrentPage + afterCurrentPage
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
						from: countPages + 1 - afterCurrentPage - beforeCurrentPage - Math.max(lastPages, 1) - lastHidedPages,
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