/*jshint camelcase: false*/
/*jshint quotmark: true*/
(function(window, $, undefined) {
    'use strict';
    
    console.log('Hello, my new app!');
    
    var appContext = $('[data-app-name="tree-demo-app"]');
  
    /* Generate Tree SVG */
    window.addEventListener('Agave::ready', function() {
	
	var form = $('form[name=tree-render]', appContext);
	form.on('submit', function(e) {
	    e.preventDefault();

	    var dataObject = { newick: this.tree.value };

	    console.log(dataObject);

	    render_tree(dataObject,this.tree_type.value);
	
	});
    });

    function render_tree(tree_object,tree_type) {
	var para = document.createElement('div');
	var node = document.createTextNode(' ');
	para.appendChild(node);

	var parent = document.getElementById('TREESPACE');
	var child = document.getElementById('svgCanvas');
	para.setAttribute('id', 'svgCanvas');
	parent.replaceChild(para,child);

	var phylocanvas;
	
	if (tree_type === 'circular') {
	    phylocanvas = new Smits.PhyloCanvas(
		tree_object,
		'svgCanvas',
		1000, 1000,
		'circular'
	    );
	} else {
	    phylocanvas = new Smits.PhyloCanvas(
		tree_object,
		'svgCanvas',
		1000, 2000
	    );
	}
	$('#files').replaceWith($('#files').clone(true));
    }
    
    function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object
	
	// Loop through the FileList and capture tree text.
	for (var i = 0, f; f = files[i]; i++) {
	    
	    var reader = new FileReader();
	    // Closure to capture the file information.
	    reader.onload = (function(theFile) {
		return function(e) {
		    // Render tree text as svg
		    var string =  e.target.result;

		    var dataObject = { newick: string };

		    console.log(dataObject);
		    console.log(string);

		    render_tree(dataObject);
		};
	    })(f);

	    reader.readAsText(f);
	}
    }
    document.getElementById('files').addEventListener('change', handleFileSelect, false);
})(window, jQuery);

