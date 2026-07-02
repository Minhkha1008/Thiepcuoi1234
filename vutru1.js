import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js"
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js"
import { EffectComposer } from "https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/postprocessing/UnrealBloomPass.js"
import * as dat from "https://cdn.skypack.dev/lil-gui"
const gui = new dat.GUI({ width: 320 })
gui.hide()
const canvas = document.querySelector('canvas.webgl')
const preview = document.querySelector('#preview')
const previewImage = document.querySelector('#previewImage')
const previewTitle = document.querySelector('#previewTitle')
const previewCloseButton = document.querySelector('#previewClose')
const loadingScreen = document.querySelector('#loadingScreen')
const loadingFill = document.querySelector('#loadingFill')
const loadingPercent = document.querySelector('#loadingPercent')
const loadingHint = document.querySelector('#loadingHint')
const loadingQuote = document.querySelector('#loadingQuote')
const musicToggle = document.querySelector('#musicToggle')

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2('#03040a', 0.055)

const galaxyGroup = new THREE.Group()
scene.add(galaxyGroup)

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const getIsPortrait = () => window.innerHeight >= window.innerWidth
const getIsMobile = () => window.matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent)

const applyViewportSettings = () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    const portrait = getIsPortrait()
    const mobile = getIsMobile()
    const fov = portrait ? 82 : 75
    const cameraPosition = portrait
        ? new THREE.Vector3(4.2, 3.35, 8.4)
        : new THREE.Vector3(4.8, 2.8, 7.2)

    camera.aspect = sizes.width / sizes.height
    camera.fov = fov
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.6 : 2))
    composer.setSize(sizes.width, sizes.height)

    controls.maxDistance = portrait ? 16 : 18
    controls.minDistance = portrait ? 2.4 : 3
    camera.position.lerp(cameraPosition, 0.18)
}

const parameters = {
    count: 6000,
    imageSize: 0.14,
    colorSize: 0.05,
    colorOpacity: 0.22,
    radius: 8.5,
    branches: 6,
    spin: 1.15,
    randomness: 0.25,
    randomnessPower: 2.4,
    insideColor: '#ffd18c',
    outsideColor: '#3d63ff',
    rotationSpeed: 0.035,
    wobble: 0.08,
    glowOpacity: 0.55,
    bloomStrength: 0.4,
    bloomRadius: 0.18,
    bloomThreshold: 0.62
}

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4.8, 2.8, 7.2)
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.95
renderer.setClearColor('#02030b', 1)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, getIsMobile() ? 1.6 : 2))

const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    parameters.bloomStrength,
    parameters.bloomRadius,
    parameters.bloomThreshold
)
composer.addPass(renderPass)
composer.addPass(bloomPass)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.maxDistance = 18
controls.minDistance = 3

applyViewportSettings()

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const loadingQuotes = [
    '8/3 này, mong nụ cười của em sáng hơn mọi vì sao.',
    'Ngân hà có hàng tỷ vì sao, còn anh chỉ cần một người là em.',
    'Đang gói chút dịu dàng, chút lấp lánh để tặng em ngày 8/3.',
    'Chúc em luôn được yêu thương, rực rỡ và bình yên.'
]

const updateLoadingQuote = (progress) => {
    const index = Math.min(
        loadingQuotes.length - 1,
        Math.floor((clamp(progress, 0, 100) / 100) * loadingQuotes.length)
    )
    loadingQuote.textContent = loadingQuotes[index]
}

const setLoadingProgress = (value, hint = '') => {
    const safeProgress = clamp(value, 0, 100)
    loadingFill.style.width = `${safeProgress}%`
    loadingPercent.textContent = `${Math.round(safeProgress)}%`
    updateLoadingQuote(safeProgress)

    if(hint){
        loadingHint.textContent = hint
    }
}

const finishLoading = () => {
    setLoadingProgress(100, 'Hoàn tất, mở cánh cửa ngân hà...')
    setTimeout(() => {
        loadingScreen.classList.add('hidden')
    }, 420)
}

setLoadingProgress(2, 'Đang thắp sao cho ngày 8/3...')

const preferredAudioFile = 'music.mp3'
const backgroundMusic = new Audio(preferredAudioFile)
backgroundMusic.loop = true
backgroundMusic.preload = 'auto'
backgroundMusic.volume = 0.45

const waitForAudioReady = () => new Promise((resolve) => {
    const complete = () => {
        backgroundMusic.removeEventListener('canplaythrough', complete)
        backgroundMusic.removeEventListener('error', complete)
        resolve()
    }

    if(backgroundMusic.readyState >= 3){
        complete()
        return
    }

    backgroundMusic.addEventListener('canplaythrough', complete, { once: true })
    backgroundMusic.addEventListener('error', complete, { once: true })
    backgroundMusic.load()
    setTimeout(complete, 1800)
})

let musicEnabled = false

const syncMusicButton = () => {
    musicToggle.classList.toggle('active', musicEnabled)
    musicToggle.textContent = musicEnabled ? 'Music: On' : 'Music: Off'
}

const startMusic = async () => {
    try {
        await backgroundMusic.play()
        musicEnabled = true
    } catch (error) {
        musicEnabled = false
    }
    syncMusicButton()
}

const stopMusic = () => {
    backgroundMusic.pause()
    musicEnabled = false
    syncMusicButton()
}

musicToggle.addEventListener('click', () => {
    if(musicEnabled){
        stopMusic()
        return
    }

    startMusic()
})

syncMusicButton()

const bindAutoMusicOnFirstInteraction = () => {
    const tryStart = async () => {
        if(musicEnabled){
            return
        }
        await startMusic()
    }

    window.addEventListener('pointerdown', tryStart, { once: true })
    window.addEventListener('keydown', tryStart, { once: true })
    window.addEventListener('touchstart', tryStart, { once: true })
}

const initAutoMusic = async () => {
    await startMusic()
    if(!musicEnabled){
        bindAutoMusicOnFirstInteraction()
    }
}

initAutoMusic()

const setPreviewVisible = (visible) => {
    preview.classList.toggle('visible', visible)
    controls.enabled = !visible
    canvas.style.cursor = visible ? 'default' : 'grab'
}

const openPreview = (fileName) => {
    if(!fileName){
        return
    }

    previewImage.src = `./${fileName}`
    previewTitle.textContent = fileName
    setPreviewVisible(true)
}

const closePreview = () => {
    setPreviewVisible(false)
    previewImage.removeAttribute('src')
    previewTitle.textContent = ''
}

previewCloseButton.addEventListener('click', closePreview)
preview.addEventListener('click', (event) => {
    if(event.target === preview){
        closePreview()
    }
})
window.addEventListener('keydown', (event) => {
    if(event.key === 'Escape' && preview.classList.contains('visible')){
        closePreview()
    }
})

let galaxyPoints = []
let imageMaterials = []
let colorMaterial = null
let coreGlow = null
let particleTextures = []
let particleFileNames = []
let imagePointClouds = []

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
raycaster.params.Points.threshold = 0.18

const textureLoader = new THREE.TextureLoader()
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()

const prepareTexture = (texture) => {
    texture.encoding = THREE.sRGBEncoding
    texture.generateMipmaps = false
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = Math.min(8, maxAnisotropy)
    texture.needsUpdate = true
    return texture
}

const createFallbackTexture = () => {
    const textureCanvas = document.createElement('canvas')
    textureCanvas.width = 128
    textureCanvas.height = 128

    const context = textureCanvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, 128, 128)

    return prepareTexture(new THREE.CanvasTexture(textureCanvas))
}

const createGlowTexture = () => {
    const size = 256
    const textureCanvas = document.createElement('canvas')
    textureCanvas.width = size
    textureCanvas.height = size

    const context = textureCanvas.getContext('2d')
    const gradient = context.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
    )

    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.9)')
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.25)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)

    const texture = new THREE.CanvasTexture(textureCanvas)
    texture.needsUpdate = true
    return texture
}

const loadTexture = (fileName) => new Promise((resolve) => {
    textureLoader.load(
        `./${fileName}`,
        (texture) => resolve(prepareTexture(texture)),
        undefined,
        () => resolve(null)
    )
})

const clearGalaxy = () => {
    for(const pointSet of galaxyPoints){
        pointSet.geometry.dispose()
        pointSet.material.dispose()
        galaxyGroup.remove(pointSet.points)
    }

    galaxyPoints = []
    imageMaterials = []
    colorMaterial = null
    imagePointClouds = []

    if(coreGlow !== null){
        coreGlow.traverse((node) => {
            if(node.material){
                if(node.material.map){
                    node.material.map.dispose()
                }
                node.material.dispose()
            }
        })
        galaxyGroup.remove(coreGlow)
        coreGlow = null
    }
}

const generateGalaxy = () => {
    if(particleTextures.length === 0){
        return
    }

    clearGalaxy()

    const textureCount = particleTextures.length
    const imagePositionsByTexture = Array.from({ length: textureCount }, () => [])
    const colorPositions = []
    const colorValues = []

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    const createParticle = (index, minRadiusRatio = 0) => {
        const radius = (minRadiusRatio + Math.random() * (1 - minRadiusRatio)) * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle = (index % parameters.branches) / parameters.branches * Math.PI * 2

        const randomStrength = parameters.randomness * radius
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomStrength
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomStrength * 0.45
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomStrength

        return {
            radius,
            x: Math.cos(branchAngle + spinAngle) * radius + randomX,
            y: randomY,
            z: Math.sin(branchAngle + spinAngle) * radius + randomZ
        }
    }

    // Exactly 50% image particles and 50% color particles
    const imageParticleCount = Math.floor(parameters.count * 0.5)
    const colorParticleCount = parameters.count - imageParticleCount

    for(let i = 0; i < imageParticleCount; i++) {
        const textureIndex = i % textureCount
        const texturePositions = imagePositionsByTexture[textureIndex]
        const particle = createParticle(i, 0.22)
        texturePositions.push(particle.x, particle.y, particle.z)
    }

    for(let i = 0; i < colorParticleCount; i++) {
        const particle = createParticle(imageParticleCount + i)
        colorPositions.push(particle.x, particle.y, particle.z)

        const t = particle.radius / parameters.radius
        colorValues.push(colorInside.r + (colorOutside.r - colorInside.r) * t)
        colorValues.push(colorInside.g + (colorOutside.g - colorInside.g) * t)
        colorValues.push(colorInside.b + (colorOutside.b - colorInside.b) * t)
    }

    for(let i = 0; i < textureCount; i++){
        if(imagePositionsByTexture[i].length === 0){
            continue
        }

        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(imagePositionsByTexture[i])
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        const baseSize = parameters.imageSize * (0.9 + Math.random() * 0.2)
        const material = new THREE.PointsMaterial({
            size: baseSize,
            sizeAttenuation: true,
            map: particleTextures[i],
            transparent: true,
            alphaTest: 0.2,
            opacity: 1,
            color: 0xffffff,
            depthWrite: true,
            blending: THREE.NormalBlending
        })

        material.userData.baseSize = baseSize
        material.userData.phase = Math.random() * Math.PI * 2

        const points = new THREE.Points(geometry, material)
        points.userData.fileName = particleFileNames[i] || ''
        galaxyGroup.add(points)
        galaxyPoints.push({ geometry, material, points })
        imageMaterials.push(material)
        imagePointClouds.push(points)
    }

    if(colorPositions.length > 0){
        const colorGeometry = new THREE.BufferGeometry()
        colorGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(colorPositions), 3))
        colorGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colorValues), 3))

        colorMaterial = new THREE.PointsMaterial({
            size: parameters.colorSize,
            sizeAttenuation: true,
            transparent: true,
            opacity: parameters.colorOpacity,
            depthWrite: false,
            blending: THREE.NormalBlending,
            vertexColors: true
        })

        const colorPoints = new THREE.Points(colorGeometry, colorMaterial)
        galaxyGroup.add(colorPoints)
        galaxyPoints.push({ geometry: colorGeometry, material: colorMaterial, points: colorPoints })
    }

    const outerGlowTexture = createGlowTexture()
    const innerGlowTexture = createGlowTexture()

    const outerGlowMaterial = new THREE.SpriteMaterial({
        map: outerGlowTexture,
        color: new THREE.Color(parameters.insideColor),
        transparent: true,
        opacity: parameters.glowOpacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })

    const innerGlowMaterial = new THREE.SpriteMaterial({
        map: innerGlowTexture,
        color: new THREE.Color('#fff4d0'),
        transparent: true,
        opacity: Math.min(1, parameters.glowOpacity * 1.25),
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })

    const outerGlow = new THREE.Sprite(outerGlowMaterial)
    const innerGlow = new THREE.Sprite(innerGlowMaterial)

    const outerSize = parameters.radius * 0.72
    const innerSize = parameters.radius * 0.28
    outerGlow.scale.set(outerSize, outerSize, 1)
    innerGlow.scale.set(innerSize, innerSize, 1)

    coreGlow = new THREE.Group()
    coreGlow.add(outerGlow)
    coreGlow.add(innerGlow)
    coreGlow.userData.outer = outerGlow
    coreGlow.userData.inner = innerGlow
    coreGlow.userData.outerSize = outerSize
    coreGlow.userData.innerSize = innerSize
    galaxyGroup.add(coreGlow)
}

const loadGalleryTextures = async () => {
    setLoadingProgress(6, 'Đang chỉnh giai điệu cho khoảnh khắc 8/3...')
    const audioReadyPromise = waitForAudioReady()

    try {
        setLoadingProgress(12, 'Đang chọn những bức ảnh đẹp nhất...')
        const response = await fetch('./manifest.json')
        const files = await response.json()
        const imageFiles = files.filter((fileName) => /\.(png|jpe?g|webp|gif|avif)$/i.test(fileName))

        if(imageFiles.length === 0){
            particleTextures = [createFallbackTexture()]
            particleFileNames = ['']
            setLoadingProgress(88, 'Chưa có ảnh, mình dùng ánh sao thay thế nhé...')
        } else {
            let loadedCount = 0
            const total = imageFiles.length

            setLoadingProgress(18, `Đang dệt kỷ niệm 0/${total}`)
            const textureResults = await Promise.all(
                imageFiles.map(async (fileName) => {
                    const texture = await loadTexture(fileName)
                    loadedCount += 1
                    const progress = 18 + (loadedCount / total) * 68
                    setLoadingProgress(progress, `Đang dệt kỷ niệm ${loadedCount}/${total}`)

                    return { fileName, texture }
                })
            )

            const validResults = textureResults.filter((result) => result.texture !== null)
            particleTextures = validResults.map((result) => result.texture)
            particleFileNames = validResults.map((result) => result.fileName)

            if(particleTextures.length === 0){
                particleTextures = [createFallbackTexture()]
                particleFileNames = ['']
                setLoadingProgress(88, 'Dự phòng xong rồi, vẫn xinh nhé')
            }
        }
    } catch (error) {
        particleTextures = [createFallbackTexture()]
        particleFileNames = ['']
        setLoadingProgress(88, 'Màu sao dự phòng đã sẵn sàng')
    }

    await audioReadyPromise
    setLoadingProgress(92, 'Đang kết thành một dải ngân hà cho em...')
    generateGalaxy()
    setLoadingProgress(98, 'Sắp xong rồi, chuẩn bị lung linh...')
    requestAnimationFrame(() => {
        finishLoading()
    })
}

loadGalleryTextures()

const getImageIntersections = (event) => {
    if(imagePointClouds.length === 0 || preview.classList.contains('visible')){
        return []
    }

    const rect = canvas.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.params.Points.threshold = Math.max(parameters.imageSize * 0.95, 0.1)
    raycaster.setFromCamera(pointer, camera)

    return raycaster.intersectObjects(imagePointClouds, false)
}

let pointerDownPosition = null
let pointerDragged = false

canvas.addEventListener('pointerdown', (event) => {
    pointerDownPosition = { x: event.clientX, y: event.clientY }
    pointerDragged = false
})

canvas.addEventListener('pointermove', (event) => {
    if(pointerDownPosition !== null){
        const dragDistance = Math.hypot(
            event.clientX - pointerDownPosition.x,
            event.clientY - pointerDownPosition.y
        )
        if(dragDistance > 6){
            pointerDragged = true
        }
    }

    const intersections = getImageIntersections(event)
    canvas.style.cursor = intersections.length > 0 ? 'pointer' : 'grab'
})

canvas.addEventListener('pointerup', (event) => {
    if(pointerDragged){
        pointerDownPosition = null
        return
    }

    const intersections = getImageIntersections(event)
    pointerDownPosition = null

    if(intersections.length === 0){
        return
    }

    openPreview(intersections[0].object.userData.fileName)
})

canvas.addEventListener('pointercancel', () => {
    pointerDownPosition = null
    pointerDragged = false
})

canvas.addEventListener('mouseleave', () => {
    if(!preview.classList.contains('visible')){
        canvas.style.cursor = 'grab'
    }
})

const galaxyFolder = gui.addFolder('Galaxy')
galaxyFolder.add(parameters, 'count').min(500).max(20000).step(100).onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'radius').min(3).max(20).step(0.1).onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'branches').min(2).max(12).step(1).onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'randomness').min(0).max(1).step(0.001).onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'randomnessPower').min(1).max(8).step(0.001).onFinishChange(generateGalaxy)
galaxyFolder.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
galaxyFolder.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

const imageFolder = gui.addFolder('Particles')
imageFolder.add(parameters, 'imageSize').min(0.04).max(0.28).step(0.001).onFinishChange(generateGalaxy)
imageFolder.add(parameters, 'colorSize').min(0.01).max(0.16).step(0.001).onFinishChange(generateGalaxy)
imageFolder.add(parameters, 'colorOpacity').min(0.02).max(0.5).step(0.001)
imageFolder.add(parameters, 'glowOpacity').min(0).max(1).step(0.001).onFinishChange(generateGalaxy)

const motionFolder = gui.addFolder('Motion')
motionFolder.add(parameters, 'rotationSpeed').min(0).max(0.15).step(0.001)
motionFolder.add(parameters, 'wobble').min(0).max(0.2).step(0.001)

const bloomFolder = gui.addFolder('Bloom')
bloomFolder.add(parameters, 'bloomStrength').min(0).max(1.2).step(0.01).onChange((value) => { bloomPass.strength = value })
bloomFolder.add(parameters, 'bloomRadius').min(0).max(1).step(0.01).onChange((value) => { bloomPass.radius = value })
bloomFolder.add(parameters, 'bloomThreshold').min(0).max(1).step(0.01).onChange((value) => { bloomPass.threshold = value })

galaxyFolder.open()
imageFolder.open()

window.addEventListener('resize', applyViewportSettings)
window.addEventListener('orientationchange', applyViewportSettings)

const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    galaxyGroup.rotation.y += parameters.rotationSpeed * deltaTime
    galaxyGroup.rotation.x = Math.sin(elapsedTime * 0.23) * parameters.wobble * 0.4
    galaxyGroup.rotation.z = Math.cos(elapsedTime * 0.18) * parameters.wobble

    for(const material of imageMaterials){
        const pulse = 1 + Math.sin(elapsedTime * 0.9 + material.userData.phase) * 0.05
        material.size = material.userData.baseSize * pulse
    }

    if(colorMaterial !== null){
        colorMaterial.opacity = parameters.colorOpacity * (0.9 + Math.sin(elapsedTime * 0.8) * 0.1)
    }

    if(coreGlow !== null){
        const outerPulse = 1 + Math.sin(elapsedTime * 1.7) * 0.08
        const innerPulse = 1 + Math.sin(elapsedTime * 2.2 + 0.5) * 0.12

        const outerGlow = coreGlow.userData.outer
        const innerGlow = coreGlow.userData.inner

        outerGlow.scale.set(
            coreGlow.userData.outerSize * outerPulse,
            coreGlow.userData.outerSize * outerPulse,
            1
        )
        innerGlow.scale.set(
            coreGlow.userData.innerSize * innerPulse,
            coreGlow.userData.innerSize * innerPulse,
            1
        )

        outerGlow.material.opacity = parameters.glowOpacity * (0.9 + Math.sin(elapsedTime * 2.0) * 0.08)
        innerGlow.material.opacity = Math.min(1, parameters.glowOpacity * 1.3) * (0.92 + Math.sin(elapsedTime * 2.6) * 0.08)
    }

    controls.update()
    composer.render()

    window.requestAnimationFrame(tick)
}

tick()