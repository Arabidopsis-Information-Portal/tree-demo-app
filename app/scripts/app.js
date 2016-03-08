/*jshint camelcase: false*/
/*jshint quotmark: true*/
/* global tnt, d3 */
(function(window, $, tnt, d3, undefined) {
    'use strict';
    console.log('Hello, Tree Viewer app!');

    var appContext = $('[data-app-name="tree-viewer-app"]');
    var defaultTree = '(((C.elegans,Fly),(((((((((Tasmanian Devil,Wallaby,Opossum),((Armadillo,Sloth),(Rock hyrax,Tenrec,Elephant),(((Rabbit,Pika),(((Rat,Mouse),Kangaroo rat,Squirrel),Guinea Pig)),((Mouse lemur,Bushbaby),((((((Chimp,Human,Gorilla),Orangutan),Gibbon),Macaque),Marmoset),Tarsier)),Tree Shrew),((Microbat,Flying fox),(Hedgehog,Shrew),((Panda,Dog,Domestic ferret),Cat),((Cow,Sheep),Pig,Alpaca,Dolphin),Horse))),Platypus),((((Collared flycatcher,Zebra finch),(Chicken,Turkey),Duck),Chinese softshell turtle),Anole lizard)),Xenopus),Coelacanth),(((Zebrafish,Cave fish),((((Medaka,Platyfish),Stickleback),(Fugu,Tetraodon),Tilapia),Cod)),Spotted gar)),Lamprey),(C.savignyi,C.intestinalis))),S.cerevisiae);';


    /* Generate Tree */
    window.addEventListener('Agave::ready', function() {
        console.log('Agave ready...');

        var render_tree = function render_tree(tree_object) {

            // DOM element
            var div = $('#tree-canvas', appContext)[0];
            // tree variables
            var width = 1000;
            var scale = false;
            var transition_speed = 2000;
            var node_size = 5;
            var node_stroke = 'black';
            var node_fill = 'grey';
            var label_fontsize = 12;
            var label_height = 20;

            // setup tree
            var tree = tnt.tree()
                .node_display(tnt.tree.node_display.circle()
                    .size(node_size)
                    .stroke(node_stroke)
                    .fill(node_fill))
                .label(tnt.tree.label.text()
                    .fontsize(label_fontsize)
                    .height(label_height)
                    .text(function(node) {
                        if (node.is_leaf()) {
                            return node.node_name();
                        }
                        return '';
                    }))
                .data(tnt.tree.parse_newick(tree_object))
                .layout(tnt.tree.layout.vertical()
                    .width(width)
                    .scale(scale))
                .duration(transition_speed);

            // set up a layout menu
            var menu_pane = d3.select(div).append('div').append('span').text('Layout: ');
            var sel = menu_pane.append('select')
                               .on('change', function() {
                                   var layout = tnt.tree.layout[this.value]().width(width).scale(scale);
                                   tree.layout(layout);
                                   tree.update();
                               });

            sel.append('option')
               .attr('value', 'vertical')
               .attr('selected', 1)
               .text('vertical');

            sel.append('option')
               .attr('value', 'radial')
               .text('radial');

            tree(div);
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
            $('#tree-canvas', appContext).empty();

            $('#file', appContext).val('');
            $('#tree_type', appContext).val('linear');
            $('#tree', appContext).val(defaultTree);
        });

        $('#tree-render', appContext).submit(function(e) {
            // clear the canvas
            $('#tree-canvas', appContext).empty();
            e.preventDefault();
            render_tree(this.tree.value);
        });
    });

})(window, jQuery, tnt, d3);
