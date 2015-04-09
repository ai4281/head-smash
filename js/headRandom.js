var container;

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var headMesh;
var headMeshGroup = new THREE.Object3D();

var origPositionArray = [];
var glitchPositionArray = [];

var shuffle = false;

init();


function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.z = 100;

	// scene

	scene = new THREE.Scene();

	var ambient = new THREE.AmbientLight( 0x303030 );
	scene.add( ambient );

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	directionalLight.position.set( 0, 1, 0.5 );
	scene.add( directionalLight );

	// texture

	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {

		console.log( item, loaded, total );
		initHeadMesh();

	};

	var texture = new THREE.Texture();

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};

	var onError = function ( xhr ) {
		console.log("error");
	};

	// model

	var loader = new THREE.OBJLoader( manager );
	loader.load( 'obj/head.obj', function ( object ) {

		object.scale.set (15, 15, 15);
		object.name = "head";
		//console.log(object.children[1]);
		headMesh = object.children[0];
		//scene.add( object );

	}, onProgress, onError );

	//

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0xffffff);
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'touchstart', onTouchStart, false );
	document.addEventListener( 'touchmove', onTouchMove, false );

	//

	window.addEventListener( 'resize', onWindowResize, false );

	
}

function initHeadMesh() {

	var p = headMesh.geometry.attributes.position.array;

	for (var i = 0; i < p.length; i++)
	{
		origPositionArray[i] = p[i];
	}


	var colorsArray = [];

	for (var i = 0; i < headMesh.geometry.attributes.position.length; i++)
	{
		colorsArray[i] = Math.random() * 255;
	}

	//console.log(colorsArray);

	var faceMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, shininess: 10, vertexColors: THREE.FaceColors, wireframe: false, shading: THREE.FlatShading});

	//headMesh.bufferGeometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( geometry.vertices ), 3 ) );

	headMesh.rotation.x = Math.PI;
	headMesh.position.z = -10;
	headMesh.scale.set(20, 20, 20);

	headMesh.material = faceMaterial;

	headMeshGroup.add(headMesh);

	scene.add(headMeshGroup);

	animate();

}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

	mouseX = ( event.clientX - windowHalfX ) / 2;
	mouseY = ( event.clientY ) / 2;

	//console.log(mouseY);
}

function onKeyDown( event ) {

	shuffle = !shuffle;

	var p = headMesh.geometry.attributes.position.array;

	for (var i = 0; i < p.length; i++)
	{
		glitchPositionArray[i] = origPositionArray[i] + Math.random() * mouseY/10000 - mouseY/20000 ;
	}

	console.log(glitchPositionArray);

}

function onTouchStart(event) {

	shuffle = !shuffle;

	var touch = event.targetTouches[0];

	mouseX = ( touch.pageX - windowHalfX ) / 2;
	mouseY = ( touch.pageY ) / 2;
}

function onTouchMove( event ) {

	event.preventDefault();

	var touch = event.targetTouches[0];

	mouseX = ( touch.pageX - windowHalfX ) / 2;
	mouseY = ( touch.pageY ) / 2;

	//console.log(mouseY);
}

//

function updateHeadMesh() {

	var p = headMesh.geometry.attributes.position.array;

	headMesh.geometry.attributes.position.needsUpdate = true;

	if (shuffle)
	{
		for (var i = 0; i<p.length; i++)
		{
			p[i] += Math.random() * mouseY/1000 - mouseY/2000 ;
		}

	}

	else
	{
		for (var i = 0; i < p.length; i++)
		{
			if (Math.abs(p[i] - glitchPositionArray[i]) > 0.0001)
			{
				p[i] -= (p[i] - glitchPositionArray[i]) / 5;
			}
			
		}
	}

	headMesh.geometry.attributes.position.needsUpdate = true;


}

function animate() {

	//headMeshGroup.rotation.y += 0.03;

	updateHeadMesh();

	requestAnimationFrame( animate );
	render();

}

function render() {

	 //camera.position.x += ( mouseX - camera.position.x ) * .05;
	 //camera.position.y += ( - mouseY - camera.position.y ) * .05;

	camera.lookAt( scene.position );

	renderer.render( scene, camera );

}