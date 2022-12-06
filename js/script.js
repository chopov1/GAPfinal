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
import * as CANNON from 'cannon-es';
import * as dat from 'dat.gui'
import { MeshStandardMaterial } from "three";
import windowsBkg from '../img/280762.jpg'
import { Vec3 } from "cannon-es";

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

const floorGeo = new THREE.BoxGeometry(20, 10, 20);
const floorMat = new MeshStandardMaterial({color: 0x00ffff});
const floor = new THREE.Mesh(floorGeo, floorMat);
scene.add(floor);

const cargoGeo1 = new THREE.BoxGeometry(2,2,2);
const cargoMat1 = new THREE.MeshStandardMaterial({color: 0x00ffee});
const cargo1 = new THREE.Mesh(cargoGeo1, cargoMat1);
scene.add(cargo1);

//#endregion

//#region cannon

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0,-10,0)
});

const floorPhyMat = new CANNON.Material();
const objPhyMat = new CANNON.Material();
const floorObjContactMat = new CANNON.ContactMaterial(floorPhyMat,objPhyMat, {friction: .1} );
world.addContactMaterial(floorObjContactMat);

const floorBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(10,5,10)),
    type: CANNON.Body.STATIC,
    material: floorPhyMat,
    position: new Vec3(0,0,0)
});
world.addBody(floorBody);

const cargo1Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(1,1,1)),
    mass: 0.5,
    material: objPhyMat,
    position: new Vec3(0,10,0)
})

world.addBody(cargo1Body);

//#endregion

//#region UI

const gui = new dat.GUI();

const guiOptions = {
WagonColor: '#0000FF', 
WagonHeight: 0,
};

gui.addColor(guiOptions, 'WagonColor').onChange(function(e){
    floor.material.color.set(e)
});

gui.add(guiOptions, "WagonHeight", -1, 8);

//#endregion

var timestep = 1/60;
const clock = new THREE.Clock();

function animate(){

    world.step(timestep);

    floorBody.position.set(0,guiOptions.WagonHeight,0);

    cargo1.position.copy(cargo1Body.position);
    cargo1.quaternion.copy(cargo1Body.quaternion);

    floor.position.copy(floorBody.position);
    floor.quaternion.copy(floorBody.quaternion);

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function (){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})