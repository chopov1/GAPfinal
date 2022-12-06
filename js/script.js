//use ctrl c to stop the program running and gain control of the console
//ThreeJS is a Y-up platform
//use f12 on website to debug
//use "npm init -y" to create package.json
//use "npm i parcel" to create node-modules - use "npm i parcel@2.7.0" if you get version error
//use "npm install three" to install threejs library
//use "npm install cannon-es" to install cannon library
//to run type "parcel ./src/index.html"
//bg pic found at https://duckduckgo.com/?q=windows+default+background+square&iax=images&ia=images&iai=https%3A%2F%2Favatarfiles.alphacoders.com%2F280%2F280762.jpg

import * as THREE from "three";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {Object3D} from "three";
import * as CANNON from 'cannon-es';
import * as dat from 'dat.gui'
import { MeshStandardMaterial } from "three";
import windowsBkg from '../img/280762.jpg'
import { Vec3 } from "cannon-es";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap';

//#region setup

const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1,1000);
camera.position.set(-10,30,30);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
scene.add(camera);

const light = new THREE.DirectionalLight( 0xFFFFFF );
light.castShadow = true;
scene.add(light);

const ambLight = new THREE.AmbientLight(0x404040);
scene.add(ambLight);

const axisHelper = new THREE.AxesHelper(20);
scene.add(axisHelper);

const textureLoader = new THREE.TextureLoader();
scene.background = textureLoader.load(windowsBkg);
//#endregion

//#region objects

//#region wagonParts
const floorObj = new Object3D();
const floorGeo = new THREE.BoxGeometry(20, 10, 20);
const floorMat = new MeshStandardMaterial({color: 0x00ffff});
const floor = new THREE.Mesh(floorGeo, floorMat);
floorObj.add(floor);
scene.add(floorObj);

const wall1Geo = new THREE.BoxGeometry(20, 6, 2);
const wall1Mat = new MeshStandardMaterial({color: 0xeeeee});
const wall1 = new THREE.Mesh(wall1Geo, wall1Mat);
wall1.position.set(0, 7, 10);
floorObj.add(wall1);

const wall2Geo = new THREE.BoxGeometry(20, 6, 2);
const wall2Mat = new MeshStandardMaterial({color: 0x111eee});
const wall2 = new THREE.Mesh(wall2Geo, wall2Mat);
wall2.position.set(0, 7, -10);
floorObj.add(wall2);

const wall3Geo = new THREE.BoxGeometry(2, 6, 20);
const wall3Mat = new MeshStandardMaterial({color: 0xeebbbb});
const wall3 = new THREE.Mesh(wall3Geo, wall3Mat);
wall3.position.set(10, 7, 0);
floorObj.add(wall3);

const wall4Geo = new THREE.BoxGeometry(2, 6, 20);
const wall4Mat = new MeshStandardMaterial({color: 0xeeefff});
const wall4 = new THREE.Mesh(wall4Geo, wall4Mat);
wall4.position.set(-10, 7, 0);
floorObj.add(wall4);
//#endregion

const cargoGeo1 = new THREE.BoxGeometry(2,2,2);
const cargoMat1 = new THREE.MeshStandardMaterial({color: 0xffbbee});
const cargo1 = new THREE.Mesh(cargoGeo1, cargoMat1);
scene.add(cargo1);

//#region gltf
const dinoURL = new URL('../assets/stegosaurs_SStenops.glb', import.meta.url);
const boyURL = new URL('../assets/Cartoon_boy.glb', import.meta.url);

const dinoObj = new Object3D();

const assetLoader = new GLTFLoader();
assetLoader.load(dinoURL.href,function(gltf){
    const dinomodel = gltf.scene;
    dinoObj.add(dinomodel);
    scene.add(dinoObj);
    //dinomodel.position.set(0,12,0);
},
undefined,
function(error){
    console.error(error);
}
)

const boyPos = new THREE.Vector3(20,0,-20);

assetLoader.load(boyURL.href,function(gltf){
    const boymodel = gltf.scene;
    scene.add(boymodel);
    boymodel.position.set(20,0,-20);
})

//#endregion

//#endregion

//#region cannon

//#region cannon world setup
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0,-10,0)
});

const floorPhyMat = new CANNON.Material();
const objPhyMat = new CANNON.Material();
const floorObjContactMat = new CANNON.ContactMaterial(floorPhyMat,objPhyMat, {friction: .1} );
world.addContactMaterial(floorObjContactMat);
//#endregion

//#region wagonPartBodies
const floorBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(10,5,10)),
    type: CANNON.Body.STATIC,
    material: floorPhyMat,
    position: new Vec3(0,0,0)
});
world.addBody(floorBody);

const wall1Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(10,3,1)),
    type: CANNON.Body.STATIC,
    material: floorPhyMat,
    position: new Vec3(0,0,0)
});
world.addBody(wall1Body);

const wall2Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(10,3,1)),
    type: CANNON.Body.STATIC,
    material: floorPhyMat,
    position: new Vec3(0,0,0)
});
world.addBody(wall2Body);

const wall3Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(1,3,10)),
    type: CANNON.Body.STATIC,
    material: floorPhyMat,
    position: new Vec3(0,0,0)
});
world.addBody(wall3Body);

const wall4Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(1,3,10)),
    type: CANNON.Body.STATIC,
    material: floorPhyMat,
    position: new Vec3(0,0,0)
});
world.addBody(wall4Body);
//#endregion

const cargo1Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(1,1,1)),
    mass: 0.5,
    material: objPhyMat,
    position: new Vec3(0, 10, 0)
})
world.addBody(cargo1Body);

const dinoBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(1,1,1)),
    mass: .8,
    material: objPhyMat,
    position: new Vec3(0,12,0)
})
world.addBody(dinoBody);

//#endregion

//#region UI

const gui = new dat.GUI();

const guiOptions = {
WagonColor: '#0000FF', 
WagonHeight: 0,
Showboy: false,
};

gui.addColor(guiOptions, 'WagonColor').onChange(function(e){
    floor.material.color.set(e)
});

const tl = gsap.timeline();
gui.add(guiOptions, "Showboy").onChange(function(e){
    tl.to(camera.position, {z:-18, duration:1, onUpdate: function(){camera.lookAt(boyPos)}})
    .to(camera.position, {y:-5, z:-16, x:16, duration: 4, onUpdate: function(){camera.lookAt(boyPos); }})
    .to(camera.position, {y: 10, duration: 3, onUpdate: function(){camera.lookAt(boyPos)}});
})

gui.add(guiOptions, "WagonHeight", -1, 8);

//#endregion

var timestep = 1/60;

function animate(){

    world.step(timestep);

    floorBody.position.set(0,guiOptions.WagonHeight,0);

    cargo1.position.copy(cargo1Body.position);
    cargo1.quaternion.copy(cargo1Body.quaternion);

    dinoObj.position.copy(dinoBody.position);
    dinoObj.quaternion.copy(dinoBody.quaternion);

    //#region updateWagonParts
    floorObj.position.copy(floorBody.position);
    floorObj.quaternion.copy(floorBody.quaternion);
    wall1Body.position.copy(wall1.position);
    wall1Body.quaternion.copy(wall1.quaternion);
    wall2Body.position.copy(wall2.position);
    wall2Body.quaternion.copy(wall2.quaternion);
    wall3Body.position.copy(wall3.position);
    wall3Body.quaternion.copy(wall3.quaternion);
    wall4Body.position.copy(wall4.position);
    wall4Body.quaternion.copy(wall4.quaternion);
    //#endregion

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function (){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})