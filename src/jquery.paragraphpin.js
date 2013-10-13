(function ($) {
  // paragraphpin plugin methods
  $.paragraphpin = {
    close: function() {
      this.trigger('paragraphpin-close');
    },

    submit: function() {
      this.trigger('paragraphpin-submit');
    },

    value: function() {
      return this.data('selectedParagraph').text();
    },

    selectedParagraph: function() {
      return this.data('selectedParagraph');
    },

    init: function(options) {
      var elt = this;
      var icons = [];
      var state = 'inactive';

      var getSelectionHtml = function() {
        var html = "";
        if (typeof window.getSelection != "undefined") {
          var sel = window.getSelection();
          if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
              container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
          }
        } else if (typeof document.selection != "undefined") {
          if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
          }
        }
        return html;
      };

      var isSelected = false;
      
      var hilite = function(selection, range) {
        var rects = range.getClientRects();
        var paraZ = parseInt(elt.css('z-index'), 10);

        if (isNaN(paraZ)) {
          paraZ = 0;
        }
        var scrollTop = $(document).scrollTop();

        $.each(rects, function(i, rect) {
          console.log(rect);
          $('<div>')
            .css({
              'position': 'absolute',
              'background-color': options.highlightColor,
              'top': (rect.top + scrollTop) + 'px',
              'left': rect.left + 'px',
              'width': rect.width + 'px',
              'height': rect.height + 'px',
              'z-index': paraZ - 1
            })
            .addClass('paragraphpin-selection')
            .prependTo($('body'));
        });
        selection.removeAllRanges();
      };

      var unHilite = function() {
        $('.paragraphpin-selection').remove();
      };

      var open = function(offset, width, height, html, element, arrowLeft) {        
        $('.paragraphpin-mask').remove();
        var $mask = $('<div>')
          .addClass('paragraphpin-mask')
          .css({
            'position': 'absolute',

            'left': offset.left - options.padding - options.borderSize + 'px',
            'top': offset.top - options.padding - options.borderSize + 'px'
          })
          .append(
            $('<div>').css({
              'width': width + options.padding * 2 + options.borderSize + 'px',
              'height': height + options.padding * 2 + options.borderSize + 'px'
            })
          )
          .append(options.toolPanel.removeClass('hide').addClass('paragraphpin-tools').show())
          .appendTo('body');

        if (options.style === 'border') {
          $mask.addClass('border');
        } else if (options.style === 'arrow') {
          $mask.find('.paragraphpin-tools')
            .removeClass('leftleft')
            .removeClass('left')
            .removeClass('midleft')
            .removeClass('mid')
            .removeClass('midright')
            .removeClass('right')
            .removeClass('rightright');

          $mask.find('.paragraphpin-tools').addClass('arrow');

          if (typeof(arrowLeft) !== 'undefined') {
            var div = 0.125;
            var perc = arrowLeft/width;
            console.log(perc);

            if (perc < (div + div/2)) {
              $mask.find('.paragraphpin-tools').addClass('leftleft');
            } else if (perc < (2*div + div/2)) {
              $mask.find('.paragraphpin-tools').addClass('left');
            } else if (perc < (3*div + div/2)) {
              $mask.find('.paragraphpin-tools').addClass('midleft');
            } else if (perc < (4*div + div/2)) {
              $mask.find('.paragraphpin-tools').addClass('mid');
            } else if (perc < (5*div + div/2)) {
              $mask.find('.paragraphpin-tools').addClass('midright');
            } else if (perc < (6*div + div/2)) {
              $mask.find('.paragraphpin-tools').addClass('right');
            } else if (perc < (7*div + div/2)) {
              $mask.find('.paragraphpin-tools').addClass('rightright');
            }
          }
        }

        options.toolPanel.find('[data-dismiss="paragraphpin"]').off('click').on('click', function() {
          close();
          return false;
        });

        options.toolPanel.find('[data-submit="paragraphpin"]').off('click').on('click', function() {
          elt.trigger('paragraphpin-submit');
          return false;
        });

        elt.trigger('paragraphpin-select', { 'html': html, 'paragraph': element });
      };

      var close = function() {
        elt.trigger('paragraphpin-close');
      };

      this.on('paragraphpin-close', function() {
        $('.paragraphpin-icon.active').removeClass('active');
        state = 'inactive';
        isSelected = false;
        unHilite();
        $('.paragraphpin-mask').remove();
      });

      this.on('paragraphpin-submit', function() {
        if (options.onSubmit) {
          options.onSubmit.call(elt, elt.data('selectedHTML'), elt.data('selectedParagraph'), options.toolPanel);
        }
      });

      this.on('paragraphpin-select', function(evt, data) {
        elt.data('selectedParagraph', data.paragraph);
        elt.data('selectedHTML', data.html);

        if (options.onSelect) {
          options.onSelect.call(elt, elt.data('selectedHTML'), elt.data('selectedParagraph'), options.toolPanel);
        }
      });

      $('.paragraphpin-icon').remove();
      $('.paragraphpin-mask').remove();
      options.toolPanel.appendTo('body').hide();

      var isSelecting = false;

      this.on('mousedown', function() {
        state = 'active';
        isSelecting = true;
      });

      this.on('mouseup', function(evt) {
        if (!isSelecting) return;

        var selectionHTML = getSelectionHtml();
        if (selectionHTML.trim() !== '' && window.getSelection) {
          var selection = window.getSelection();
          var range = selection.getRangeAt(0);
          var boundary = range.getBoundingClientRect();
          console.log(boundary);

          close();
          $.each(icons, function(i, $icon) {
            $icon.fadeOut();
          });

          hilite(selection, range);
          var offset = {
            top: boundary.top + $(document).scrollTop(),
            left: elt.offset().left
          };

          var arrowLeft = (boundary.left + boundary.width/2) - offset.left;
          
          open(offset, elt.width(), boundary.height, selectionHTML, null, arrowLeft);

          isSelected = true;
          state = 'active';
        } else {
          isSelected = false;
          state = 'inactive';
        }

        isSelecting = false;
      });

      this.children('p').each(function(i, p) {
        var $p = $(p);
        var offset = $p.offset();
        var iconOffset = 0;
        var icon = options.iconElement.clone().hide();

        icons.push(icon);

        var iconAppearTimeout;
        var iconHideTimeout;

        $p.on('click', function () {
          if (state === 'active') return;
          
          clearTimeout(iconHideTimeout);
          icon.fadeIn();
        });

        icon.on('mouseenter', function() {
          if (state === 'active') return;
          
          clearTimeout(iconHideTimeout);
          icon.fadeIn();
        }).on('click', function() {
          if (state === 'active') {
            close();
            return;
          }

          $.each(icons, function(i, $icon) {
            if ($icon !== icon) {
              $icon.removeClass('active');
            }
          });

          icon.addClass('active');
          state = 'active';
          open(offset, $p.width(), $p.height(), $p.html(), $p);
        });

        $p.on('mouseenter', function() {
          if (state === 'active') return;

          $.each(icons, function(i, $icon) {
            if ($icon !== icon) {
              $icon.fadeOut();
            }
          });

          clearTimeout(iconAppearTimeout);
          iconAppearTimeout = setTimeout(function() {
            icon.fadeIn();
          }, 500);
        }).on('mouseleave', function() {
          if (state === 'active') return;
          
          clearTimeout(iconAppearTimeout);
          clearTimeout(iconHideTimeout);
          iconHideTimeout = setTimeout(function() {
            icon.fadeOut();
          }, 700);
        });

        icon
          .css({
            'position': 'absolute',
            'left': offset.left + 'px',
            'top': offset.top + 'px'
          })
          .addClass('paragraphpin-icon')
          .addClass(options.iconClass)
          .appendTo(options.parentElement);

        if ($p.attr(options.pinDataAttr)) {
          icon.find('#' + options.pinDataID)
            .html($p.attr(options.pinDataAttr));

          iconOffset = icon.width();
          icon.addClass('hasData');
          iconOffset = iconOffset - icon.width();
          console.log(offset.left, iconOffset);
          icon.css('left', (offset.left + iconOffset) + 'px');
        }
      });
    }
  };

  // paragraphpin element plugin
  $.fn.paragraphpin = function() {
    var action, args;
    var options = {
      parentElement: $('body'),
      iconClass: 'paragraphpin-icon',
      toolPanel: $('<div>Tool Panel</div>'),
      iconElement: $('<div><span id="pin-data"></span> <i class="icon-pushpin"></i></div>'),
      borderSize: 10,
      padding: 2,
      style: 'border',
      highlightColor: '#ddeeff',
      pinDataAttr: 'data-pin',
      pinDataID: 'pin-data'
    };

    if (typeof arguments[0] === 'string') {
      action = arguments[0];
      args = Array.prototype.slice.call(arguments, 1);

      var returnVal = null;
      this.each(function(i, elt) {
        returnVal = $.paragraphpin[action].apply($(elt), args);
      });

      if (returnVal) {
        return returnVal;
      }
    } else if (typeof arguments[0] === 'object' || typeof arguments[0] === 'undefined') {

      if (arguments[0]) {
        options = $.extend(options, arguments[0]);
      }

      this.each(function(i, elt) {
        $.paragraphpin.init.call($(elt), options);
      });
    }

    return this;
  };

}(jQuery));
