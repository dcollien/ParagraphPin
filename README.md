# Paragraph Pin jQuery Plugin

Creates a popup tool/input panel on paragraph or text selection. Can be used for saving, or creating notes on paragraphs and selections.


Example usage:

    <div id="paragraphs">
      <p>Lorem ipsum dolor sit amet</p>
      <p data-pin="3">Lorem ipsum dolor sit amet</p>
    </div>



    $('#paragraphs').paragraphpin({
      // default options
      parentElement: $('body'),
      iconClass: 'paragraphpin-icon',
      toolPanel: $('<div>Tool Panel</div>'),
      iconElement: $('<div><span id="pin-data"></span> <i class="icon-pushpin"></i></div>'),
      borderSize: 10,
      padding: 2,
      style: 'border', // alternatively 'arrow' for a different style of popup
      highlightColor: '#ddeeff',
      pinDataAttr: 'data-pin',
      pinDataID: 'pin-data'

      // example handlers
      onSubmit: function(html, paragraph, panel) {
        // html: the HTML code for the selection or paragraph
        // paragraph: the paragraph which was selected (if a paragraph icon is used)
        // panel: the toolPanel element

        // close the popup
        this.paragraphpin('close');
      },

      onSelect: function(html, para, panel) {
        console.log('Selected:\n', html);
      }
    });

