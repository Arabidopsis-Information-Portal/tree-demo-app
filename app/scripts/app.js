/*jshint camelcase: false*/
/*jshint quotmark: true*/
/* global tnt, d3, Clipboard */
(function(window, $, tnt, d3, undefined) {
    'use strict';
    console.log('Hello, Tree Viewer app!');

    var appContext = $('[data-app-name="tree-viewer-app"]');
    var defaultTree = '(((C.elegans,Fly),(((((((((Tasmanian Devil,Wallaby,Opossum),((Armadillo,Sloth),(Rock hyrax,Tenrec,Elephant),(((Rabbit,Pika),(((Rat,Mouse),Kangaroo rat,Squirrel),Guinea Pig)),((Mouse lemur,Bushbaby),((((((Chimp,Human,Gorilla),Orangutan),Gibbon),Macaque),Marmoset),Tarsier)),Tree Shrew),((Microbat,Flying fox),(Hedgehog,Shrew),((Panda,Dog,Domestic ferret),Cat),((Cow,Sheep),Pig,Alpaca,Dolphin),Horse))),Platypus),((((Collared flycatcher,Zebra finch),(Chicken,Turkey),Duck),Chinese softshell turtle),Anole lizard)),Xenopus),Coelacanth),(((Zebrafish,Cave fish),((((Medaka,Platyfish),Stickleback),(Fugu,Tetraodon),Tilapia),Cod)),Spotted gar)),Lamprey),(C.savignyi,C.intestinalis))),S.cerevisiae);';
    var base_ensembl_url = 'http://ensemblgenomes.org/id/';
    var base_araport_url = 'https://apps.araport.org/thalemine/portal.do?class=Gene&externalids=';


    /* Generate Tree */
    window.addEventListener('Agave::ready', function() {
        console.log('Agave ready...');
        var Agave = window.Agave;

        var init = function init() {
            console.log( 'Initializing tree-viewer app...' );
            new Clipboard('.btn-clipboard');
        };

        var is_valid_agi_identifier = function is_valid_agi_identifier(id) {
            var pattern = /AT[1-5MC]G[0-9]{5,5}(\.[0-9])?/i;
            return id.match(pattern) ? true : false;
        };

        var color = function color(node, val) {
            var name = node.node_name();
            if (name.toLowerCase().indexOf(val.toLowerCase()) > -1 && val !== '') {
                return 'red';
            }
            return 'black';
        };

        var render_tree = function render_tree(tree_object) {
            // empty the div
            $('#tree-canvas', appContext).empty();

            // parse the newick format
            var ntree = tnt.tree.parse_newick(tree_object);

            // DOM element
            var div = $('#tree-canvas', appContext)[0];
            // tree variables
            var width = 1000;
            var scale = false;
            var transition_speed = 500;
            var node_size = 5;
            var node_stroke = 'black';
            var node_fill = 'steelblue';
            var node_display_size = 12;
            var label_color = 'black';
            var label_fontsize = 12;
            var label_height = 20;

            var expanded_node = tnt.tree.node_display.circle()
                .size(node_size)
                .fill(node_fill)
                .stroke(node_stroke);

            var collapsed_node = tnt.tree.node_display.triangle()
                .size(node_size)
                .fill(node_fill)
                .stroke(node_stroke);

            var node_display = tnt.tree.node_display()
                .size(node_display_size)
                .display(function(node) {
                    if (node.is_collapsed()) {
                        collapsed_node.display().call(this, node);
                    } else {
                        expanded_node.display().call(this, node);
                    }
                });

            // setup tree
            var tree = tnt.tree()
                .node_display(node_display)
                .label(tnt.tree.label.text()
                    .color(label_color)
                    .fontsize(label_fontsize)
                    .height(label_height)
                    .text(function(node) {
                        if (node.is_leaf()) {
                            return node.node_name();
                        }
                        return '';
                    }))
                .data(ntree)
                .layout(tnt.tree.layout.vertical()
                    .width(width)
                    .scale(scale))
                .duration(transition_speed);

            tree.on('click', function(node) {
                node.toggle();
                tree.update();
            });

            tree.on('mouseover', function(node) {
                if (node.is_leaf() && node.node_name() !== '') {
                    var eg_url = base_ensembl_url + node.node_name();
                    var eg_link = '<a href="' + eg_url + '" target="_blank">' + node.node_name() + '<i class="fa fa-external-link"></i></a>';
                    var rows = [{'label': 'Ensembl Genomes', 'value': eg_link}];
                    if (is_valid_agi_identifier(node.node_name())) {
                        var locus_id = node.node_name();
                        if (locus_id.indexOf('.') !== -1) {
                            locus_id = locus_id.slice(0, locus_id.indexOf('.'));
                        }
                        var a_url = base_araport_url + locus_id;
                        var a_link = '<a href="' + a_url + '" target="_blank">' + node.node_name() + '<i class="fa fa-external-link"></i></a>';
                        rows.push({'label': 'Araport', 'value': a_link});
                    }
                    tnt.tooltip.table()
                        .width(220)
                        .call(this, {
                            'header':'Node',
                            'rows': rows
                        });
                }
            });

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

            // set up a search box
            var search = menu_pane.append('span')
                .style('margin-left', '50px')
                .text('Search in tree: ');

            search.append('input')
                .attr('type', 'text')
                .attr('id', 'search-tree')
                .on('input', function() {
                    var val = this.value;
                    tree.node_display().fill(function(node) {
                        return color(node, val);
                    });
                    tree.label().color(function(node) {
                        return color(node, val);
                    });
                    tree.update_nodes();
                });

            tree(div);
        };

        var errorMessage = function errorMessage(message) {
            return '<div class="alert alert-danger fade in" role="alert">' +
               '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
               '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">Error:</span> ' +
               message + '</div>';
        };

        var disableForm = function disableForm() {
            $('#file', appContext).prop('disabled', true);
            $('#tree', appContext).prop('disabled', true);
            $('#drawButton', appContext).prop('disabled', true);
            $('#clearButton', appContext).prop('disabled', true);
            $('#copyButton', appContext).prop('disabled', true);
        };

        var enableForm = function enableForm() {
            $('#file', appContext).prop('disabled', false);
            $('#tree', appContext).prop('disabled', false);
            $('#drawButton', appContext).prop('disabled', false);
            $('#clearButton', appContext).prop('disabled', false);
            $('#copyButton', appContext).prop('disabled', false);
        };

        init();

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
            $('#tree-canvas', appContext).html('<h4>Please select data to draw a tree.</h4>');

            // clear the errors
            $('#error', appContext).empty();

            $('#locus_id', appContext).val('AT3G52430');
            $('#file', appContext).val('');
            $('#tree_type', appContext).val('linear');
            $('#tree', appContext).val(defaultTree);
            $('a[href="#about"]', appContext).tab('show');
        });

        $('#queryButton', appContext).on('click', function (e) {
            e.preventDefault();
            var locus_id = $('#locus_id', appContext).val();
            // validate the locus_id
            if (! is_valid_agi_identifier(locus_id)) {
                $('#error', appContext).html(errorMessage('Please enter a valid AGI identifier!'));
                return;
            }
            // rest.ensemblgenomes.org/genetree/id/{id} seems to barf when searching transcripts
            if (locus_id.indexOf('.') !== -1) {
                locus_id = locus_id.slice(0, locus_id.indexOf('.'));
            }
            var qbutton = $(this);
            qbutton.html('<i class="fa fa-refresh fa-spin"></i> Querying...');
            qbutton.prop('disabled', true);
            disableForm();
            console.log('Query ensemblgenomes genetree for ' + locus_id + '...');

            $.ajax({
                url: 'https://api.araport.org/community/v0.3/ensemblgenomes/rest_ensemblgenomes_v0.1/access/genetree/member/id/' + locus_id,
                data: {'content-type': 'text/x-nh', 'nh_format': 'full'},
                headers: {'Authorization': 'Bearer ' + Agave.token.accessToken},
                error: function (err) {
                    var msg = 'Problem querying for \'' + locus_id + '\' at EnsemblGenomes. Please try again.';
                    $('#error', appContext).html(errorMessage(msg));
                    console.error('Error querying for \'' + locus_id + '\' at EnsemblGenomes --> Status: ' + err.status + ' (' + err.statusText + ')  Response: ' + err.responseText);
                    qbutton.html('Query');
                    qbutton.prop('disabled', false);
                    enableForm();
                },
                success: function (data) {
                    if (! (data) || data === '') {
                        var msg = 'Problem querying for \'' + locus_id + '\' at EnsemblGenomes. Please try again.';
                        $('#error', appContext).html(errorMessage(msg));
                        console.error(msg);
                        qbutton.html('Query');
                        qbutton.prop('disabled', false);
                        enableForm();
                        return;
                    }
                    $('#tree', appContext).val(data);
                    qbutton.html('Query');
                    qbutton.prop('disabled', false);
                    enableForm();
                    $('#drawButton', appContext).trigger('click');
                }
            });
        });

        $('#tree-render', appContext).submit(function(e) {
            e.preventDefault();

            // clear the canvas
            $('#tree-canvas', appContext).html('<h4>Loading tree information...</h4>');
            $('a[href="#tree-space"]', appContext).tab('show');
            render_tree(this.tree.value);
        });
    });

})(window, jQuery, tnt, d3);
