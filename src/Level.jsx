import * as THREE from 'three';
import {RigidBody, CuboidCollider} from "@react-three/rapier";
import {useMemo, useRef, useState} from 'react'
import {useFrame} from '@react-three/fiber';
import {useGLTF} from "@react-three/drei";

THREE.ColorManagement.legacyMode = false;

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const floor1Material = new THREE.MeshStandardMaterial({color: 'limegreen'});
const floor2Material = new THREE.MeshStandardMaterial({color: 'greenyellow'});
const obstacleMaterial = new THREE.MeshStandardMaterial({color: 'orangered'});
const wallMaterial = new THREE.MeshStandardMaterial({color: 'slategrey'});

function BlockStart({position = [0, 0, 0]}) {
    return <group position={position}>
        <mesh geometry={boxGeometry} material={floor1Material} position={[0, -0.1, 0]} scale={[4, 0.2, 4]}
              recieveShadow/>
    </group>
}

export function BlockSpinner({position = [0, 0, 0]}) {
    const obstacle = useRef();
    const [speed] = useState(() => (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1))

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const rotation = new THREE.Quaternion();
        rotation.setFromEuler(new THREE.Euler(0, time * speed, 0));
        obstacle.current.setNextKinematicRotation(rotation)
    });

    return <group position={position}>
        <mesh geometry={boxGeometry} material={floor2Material} position={[0, -0.1, 0]} scale={[4, 0.2, 4]}
              recieveShadow={true}/>
        <RigidBody ref={obstacle} type="kinematicPosition" position={[0, 0.3, 0]} restitution={0.2} friction={0}>
            <mesh geometry={boxGeometry} material={obstacleMaterial} scale={[3.5, 0.3, 0.3]} castShadow
                  recieveShadow/>
        </RigidBody>
    </group>
}

export function BlockLimbo({position = [0, 0, 0]}) {
    const obstacle = useRef();
    const [timeOffset] = useState(() => Math.random() * Math.PI * 2)

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const y = Math.sin(time + timeOffset) + 1.15;
        obstacle.current.setNextKinematicTranslation({x: position[0], y: position[1] + y, z: position[2]})
    });

    return <group position={position}>
        <mesh geometry={boxGeometry} material={floor2Material} position={[0, -0.1, 0]} scale={[4, 0.2, 4]}
              recieveShadow={true}/>
        <RigidBody ref={obstacle} type="kinematicPosition" position={[0, 0.3, 0]} restitution={0.2} friction={0}>
            <mesh geometry={boxGeometry} material={obstacleMaterial} scale={[3.5, 0.3, 0.3]} castShadow
                  recieveShadow/>
        </RigidBody>
    </group>
}

export function BlockSliding({position = [0, 0, 0]}) {
    const obstacle = useRef();
    const [timeOffset] = useState(() => Math.random() * Math.PI * 2)

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const x = Math.sin(time + timeOffset) * 1.25;
        obstacle.current.setNextKinematicTranslation({x: position[0] + x, y: position[1] + 0.75, z: position[2]})
    });

    return <group position={position}>
        <mesh geometry={boxGeometry} material={floor2Material} position={[0, -0.1, 0]} scale={[4, 0.2, 4]}
              recieveShadow={true}/>
        <RigidBody ref={obstacle} type="kinematicPosition" position={[0, 0.3, 0]} restitution={0.2} friction={0}>
            <mesh geometry={boxGeometry} material={obstacleMaterial} scale={[1.5, 1.5, 0.3]} castShadow
                  recieveShadow/>
        </RigidBody>
    </group>
}

function BlockEnd({position = [0, 0, 0]}) {
    const hamburger = useGLTF("./hamburger.glb")
    hamburger.scene.children.forEach((mesh) => {
        mesh.castShadow = true;
    })
    return <group position={position}>
        <mesh geometry={boxGeometry} material={floor1Material} position={[0, 0, 0]} scale={[4, 0.2, 4]}
              recieveShadow/>
        <RigidBody type="fixed" colliders="hull" position={[0, 0.25, 0]} restitution={0.2} friction={0}>
            <primitive object={hamburger.scene} scale={0.2}/>
        </RigidBody>
    </group>
}

function Bounds({length = 1}) {
    return <>
        <RigidBody type="fixed" restitution={0.2} friction={0}>
            <mesh position={[2.15, 0.75, -(length * 2) + 2]} geometry={boxGeometry} material={wallMaterial}
                  scale={[0.3, 1.5, 4 * length]} castShadow/>
            <mesh position={[-2.15, 0.75, -(length * 2) + 2]} geometry={boxGeometry} material={wallMaterial}
                  scale={[0.3, 1.5, 4 * length]} recieveShadow/>
            <mesh position={[0, 0.75, -(length * 4) + 2]} geometry={boxGeometry} material={wallMaterial}
                  scale={[4, 1.5, 0.3]} recieveShadow/>
            <CuboidCollider args={[2,0.1,2*length]} position={[0,-0.1,-(length*2) + 2]} restitution={0.2} friction={1}/>
        </RigidBody>
    </>
}

export function Level({count = 5, types = [BlockSpinner, BlockLimbo, BlockSliding]}) {
    const blocks = useMemo(() => {
        const blocks = [];
        for (let i = 0; i < count; i++) {
            blocks.push(types[Math.floor(Math.random() * types.length)])
        }
        return blocks;
    }, [count, types]);

    return <>
        <BlockStart position={[0, 0, 0]}/>
        {blocks.map((Block, index) => <Block key={index} position={[0, 0, -(index + 1) * 4]}/>)}

        <BlockEnd position={[0, 0, -(count + 1) * 4]}/>

        <Bounds length={count + 2}/>
    </>
}