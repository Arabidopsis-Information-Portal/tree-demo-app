/*jshint camelcase: false*/
/*jshint quotmark: true*/
/* global Smits */
(function(window, $, Smits, undefined) {
    'use strict';
    console.log('Hello, Tree Viewer app!');

    var appContext = $('[data-app-name="tree-viewer-app"]');
    var defaultTree = '(((Espresso:2,(Milk Foam:2,Espresso Macchiato:5,((Steamed Milk:2,Cappuccino:2,(Whipped Cream:1,Chocolate Syrup:1,Cafe Mocha:3):5):5,Flat White:2):5):5):1,Coffee arabica:0.1,(Columbian:1.5,((Medium Roast:1,Viennese Roast:3,American Roast:5,Instant Coffee:9):2,Heavy Roast:0.1,French Roast:0.2,European Roast:1):5,Brazilian:0.1):1):1,Americano:10,Water:1);';
    Smits.PhyloCanvas.Render.Style.line.stroke = 'rgb(0,0,255)';    // Color lines blue
    Smits.PhyloCanvas.Render.Style.text['font-size'] = 10;   // decrease font size

    /* Generate Tree SVG */
    window.addEventListener('Agave::ready', function() {
        console.log('Agave ready...');
        var render_tree = function render_tree(tree_object,tree_type) {
            var phylocanvas;

            if (tree_type === 'circular') {
                phylocanvas = new Smits.PhyloCanvas(
                    tree_object,
                    'svgCanvas',
                    1500, 1500,
                    'circular'
                );
            } else {
                phylocanvas = new Smits.PhyloCanvas(
                    tree_object,
                    'svgCanvas',
                    1000, 2000
                );
            }
        };

        $('#file', appContext).on('change', function(evt) {
            var input_file = evt.target.files[0]; // FileList object

            if (input_file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var contents = e.target.result;
                    console.log('Got filename: ' + input_file.name + '  type: ' + input_file.type + '  size: ' + input_file.size);
                    $('#tree', appContext).val(contents);
                };
                reader.readAsText(input_file);
            } else {
                console.error('Failed to load file!');
            }
        });

        $('#clearButton', appContext).on('click', function () {
            // clear the canvas
            $('#svgCanvas', appContext).empty();

            $('#file', appContext).val('');
            $('#tree_type', appContext).val('linear');
            $('#tree', appContext).val(defaultTree);
        });

        $('#tree-render', appContext).submit(function(e) {
            // clear the canvas
            $('#svgCanvas', appContext).empty();
            e.preventDefault();
            var dataObject = { newick: this.tree.value };
            console.log(dataObject);
            render_tree(dataObject,this.tree_type.value);
        });
    });

})(window, jQuery, Smits);
