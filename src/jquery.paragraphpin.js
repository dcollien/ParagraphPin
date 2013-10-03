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

      var close = function() {
        elt.trigger('paragraphpin-close');
      };

      this.on('paragraphpin-close', function() {
        $('.paragraphpin-icon.active').removeClass('active');
        state = 'inactive';

        $('.paragraphpin-mask').remove();
      });

      this.on('paragraphpin-submit', function() {
        if (options.onSubmit) {
          options.onSubmit.call(elt, elt.data('selectedParagraph'), options.toolPanel);
        }
      });

      this.on('paragraphpin-select', function(evt, $selectedParagraph) {
        elt.data('selectedParagraph', $selectedParagraph);

        if (options.onSelect) {
          options.onSelect.call(elt, elt.data('selectedParagraph'), options.toolPanel);
        }
      });

      $('.paragraphpin-icon').remove();
      $('.paragraphpin-mask').remove();
      options.toolPanel.appendTo('body').hide();
      this.children('p').each(function(i, p) {
        var $p = $(p);
        var offset = $p.offset();

        var icon = options.iconElement.clone().hide();

        icons.push(icon);

        var iconAppearTimeout;
        var iconHideTimeout;

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
                'width': $p.width() + options.padding * 2 + options.borderSize + 'px',
                'height': $p.height() + options.padding * 2 + options.borderSize + 'px'
              })
            )
            .append(options.toolPanel.removeClass('hide').addClass('paragraphpin-tools').show())
            .appendTo('body');

          if (options.style === 'border') {
            $mask.addClass('border');
          } else if (options.style === 'arrow') {
            $mask.find('.paragraphpin-tools').addClass('arrow');
          }

          options.toolPanel.find('[data-dismiss="paragraphpin"]').off('click').on('click', function() {
            close();
            return false;
          });

          options.toolPanel.find('[data-submit="paragraphpin"]').off('click').on('click', function() {
            elt.trigger('paragraphpin-submit');
            return false;
          });

          elt.trigger('paragraphpin-select', $p);
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
      iconElement: $('<div><i class="icon-pushpin"></i></div>'),
      borderSize: 10,
      padding: 2,
      style: 'border'
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

      console.log(options);

      this.each(function(i, elt) {
        $.paragraphpin.init.call($(elt), options);
      });
    }

    return this;
  };

}(jQuery));
