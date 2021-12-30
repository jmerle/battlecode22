import { basename } from 'path'
import { Config } from './config'
import * as cst from "./constants"
type Image = HTMLImageElement

export type AllImages = {
  star: Image,
  tiles: Array<Image>,
  robots: {
    archon: Array<Image>,
    builder: Array<Image>,
    lab: Array<Image>,
    sage: Array<Image>,
    soldier: Array<Image>,
    watchtower: Array<Image>,
  },
  resources: {
    lead: Image,
    gold: Image
  }
  effects: { // TODO
  },
  controls: {
    goNext: Image,
    goPrevious: Image,
    playbackPause: Image,
    playbackStart: Image,
    playbackStop: Image,
    matchForward: Image,
    matchBackward: Image,
    reverseUPS: Image,
    doubleUPS: Image,
    halveUPS: Image,
    goEnd: Image
  }
}

export function loadAll(config: Config, callback: (arg0: AllImages) => void) {
  const dirname = "./static/img/"

  const NEUTRAL: number = 0
  const RED: number = 1
  const BLU: number = 2

  function loadImage(obj, slot, path, src?): void {
    const f = loadImage
    f.expected++
    const image = new Image()

    function onFinish() {
      if (f.requestedAll && f.expected == f.success + f.failure) {
        console.log(`Total ${f.expected} images loaded: ${f.success} successful, ${f.failure} failed.`)
        callback((Object.freeze(result) as unknown) as AllImages)
      }
    }

    image.onload = () => {
      obj[slot] = image
      f.success++
      onFinish()
    }

    image.onerror = () => {
      obj[slot] = image
      f.failure++
      console.error(`CANNOT LOAD IMAGE: ${slot}, ${path}, ${image}`)
      if (src) console.error(`Source: ${src}`)
      onFinish()
    }

    // might want to use path library
    // webpack url loader triggers on require("<path>.png"), so .png should be explicit
    image.src = (src ? src : require(dirname + path + '.png').default)
  }
  loadImage.expected = 0
  loadImage.success = 0
  loadImage.failure = 0
  loadImage.requestedAll = false

  const result = {
    tiles: [],
    robots: {
      archon: [],
      watchtower: [],
      builder: [],
      miner: [],
      sage: [],
      soldier: [],
      laboratory: [],
    },
    resources: {
      lead: null,
      gold: null
    },
    effects: {
      death: null,
      embezzle: [],
      empower_red: [],
      empower_blue: [],
      expose: [],
      camouflage_red: [],
      camouflage_blue: []
    },
    controls: {
      goNext: null,
      goPrevious: null,
      playbackPause: null,
      playbackStart: null,
      playbackStop: null,
      matchForward: null,
      matchBackward: null,
      reverseUPS: null,
      doubleUPS: null,
      halveUPS: null,
      goEnd: null
    }
  }
  // helper function to manipulate images
  const htmlToData = (ele: HTMLImageElement): ImageData => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error("Error while converting a tile image")
    canvas.width = ele.width
    canvas.height = ele.height
    context.drawImage(ele, 0, 0)
    return context.getImageData(0, 0, ele.width, ele.height)
  }
  const dataToSrc = (data: ImageData): String => {
    var canvas = document.createElement("canvas")
    canvas.width = data.width
    canvas.height = data.height
    var context = canvas.getContext("2d")
    if (!context) throw new Error("Error while converting a tile images")
    context.putImageData(data, 0, 0)

    return canvas.toDataURL(`edited.png`)
  }

  loadImage(result, 'star', 'star')

  // terrain tiles
  {
    // const tintData = (data: ImageData, colors: Uint8Array): ImageData => {
    //   const arr = new Uint8ClampedArray(data.data.length)
    //   for (let i = 0; i < arr.length; i += 4) {
    //     const rock = data.data[i] > 128;
    //     const factor = rock ? 1.5 : 1;
    //     arr[i + 0] = colors[0] / factor;
    //     arr[i + 1] = colors[1] / factor;
    //     arr[i + 2] = colors[2] / factor;
    //     arr[i + 3] = 240
    //   }
    //   const result = new ImageData(arr, data.height)
    //   return result
    // }

    const randomTile = (dim: number, colors: Uint8Array, level: number): ImageData => {
      var seed = level + 1 //avoid 0
      function srand() {
        var x = Math.sin(seed++) * 10000
        return x - Math.floor(x)
      }

      const arr = new Uint8ClampedArray(dim ** 2 * 4)
      for (let i = 0; i < arr.length; i += 4) {
        var scale = 8 * (2 + level) / 255
        var shade = srand() * scale + 1 - scale;
        arr[i + 0] = colors[level][0] * shade
        arr[i + 1] = colors[level][1] * shade
        arr[i + 2] = colors[level][2] * shade
        arr[i + 3] = 255
      }
      const result = new ImageData(arr, dim)
      return result

    }

    // const baseTile: Image = new Image()
    // baseTile.src = require(dirname + 'tiles/terrain3.png').default

    const nLev = cst.TILE_COLORS.length
    // baseTile.onload = () => {
    //   for (let i = 0; i < nLev; i++) {
    //     const data: ImageData = htmlToData(baseTile)
    //     const tinted: ImageData = randomTile(25, <Uint8Array><unknown>cst.TILE_COLORS, i)
    //     const path: String = dataToSrc(tinted)
    //     loadImage(result.tiles, i, "", path.slice(0, path.length - 4))
    //   }
    // }

    for (let i = 0; i < nLev; i++) {
      const tinted: ImageData = randomTile(25, <Uint8Array><unknown>cst.TILE_COLORS, i)
      const path: String = dataToSrc(tinted)
      loadImage(result.tiles, i, "", path.slice(0, path.length - 4))
    }
  }

  // robot sprites
  loadImage(result.robots.archon, RED, 'robots/red_archon_portable')
  loadImage(result.robots.watchtower, RED, 'robots/red_watchtower')
  loadImage(result.robots.builder, RED, 'robots/red_builder')
  loadImage(result.robots.miner, RED, 'robots/red_miner')
  loadImage(result.robots.sage, RED, 'robots/red_sage')
  loadImage(result.robots.soldier, RED, 'robots/red_soldier')
  loadImage(result.robots.laboratory, RED, 'robots/red_lab')

  loadImage(result.robots.archon, BLU, 'robots/blue_archon_portable')
  loadImage(result.robots.watchtower, BLU, 'robots/blue_watchtower')
  loadImage(result.robots.builder, BLU, 'robots/blue_builder')
  loadImage(result.robots.miner, BLU, 'robots/blue_miner')
  loadImage(result.robots.sage, BLU, 'robots/blue_sage')
  loadImage(result.robots.soldier, BLU, 'robots/blue_soldier')
  loadImage(result.robots.laboratory, BLU, 'robots/blue_lab')

  loadImage(result.resources, 'lead', 'resources/lead')
  loadImage(result.resources, 'gold', 'resources/gold')


  // loadImage(result.robots.enlightenmentCenter, NEUTRAL, 'robots/center');

  // effects
  // loadImage(result.effects, 'death', 'effects/death/death_empty');

  // loadImage(result.effects.embezzle, 0, 'effects/embezzle/slanderer_embezzle_empty_1');
  // loadImage(result.effects.embezzle, 1, 'effects/embezzle/slanderer_embezzle_empty_2');

  {
    const makeTransparent = (data: ImageData): ImageData => {
      const arr = new Uint8ClampedArray(data.data.length)
      for (let i = 0; i < arr.length; i += 4) {
        arr[i + 0] = data.data[i + 0]
        arr[i + 1] = data.data[i + 1]
        arr[i + 2] = data.data[i + 2]
        arr[i + 3] = data.data[i + 3] / 1.4
      }
      const result = new ImageData(arr, data.width)
      return result
    }

    const makeRed = (data: ImageData): ImageData => {
      const arr = new Uint8ClampedArray(data.data.length)
      for (let i = 0; i < arr.length; i += 4) {
        arr[i + 0] = 255
        arr[i + 1] = 0
        arr[i + 2] = 0
        arr[i + 3] = data.data[i + 3]
      }
      const result = new ImageData(arr, data.width)
      return result
    }

    const makeBlue = (data: ImageData): ImageData => {
      const arr = new Uint8ClampedArray(data.data.length)
      for (let i = 0; i < arr.length; i += 4) {
        arr[i + 0] = 0
        arr[i + 1] = 0
        arr[i + 2] = 255
        arr[i + 3] = data.data[i + 3]
      }
      const result = new ImageData(arr, data.width)
      return result
    }

    for (let i = 0; i < 2; i++) {
      const base: Image = new Image()
      base.src = require(dirname + `effects/empower/polit_empower_empty_${i + 1}.png`).default

      base.onload = () => {
        const data: ImageData = htmlToData(base)
        const trans: ImageData = makeTransparent(data)
        const red: ImageData = makeRed(trans)
        const blue: ImageData = makeBlue(trans)
        const path_red: String = dataToSrc(red)
        const path_blue: String = dataToSrc(blue)
        loadImage(result.effects.empower_red, i, "", path_red.slice(0, path_red.length - 4))
        loadImage(result.effects.empower_blue, i, "", path_blue.slice(0, path_blue.length - 4))
      }
    }
  }

  loadImage(result.effects.expose, 0, 'effects/expose/expose_empty')

  loadImage(result.effects.camouflage_red, 0, 'effects/camouflage/camo_red')
  loadImage(result.effects.camouflage_blue, 0, 'effects/camouflage/camo_blue')

  // buttons are from https://material.io/resources/icons
  loadImage(result.controls, 'goNext', 'controls/go-next')
  loadImage(result.controls, 'goPrevious', 'controls/go-previous')
  loadImage(result.controls, 'playbackPause', 'controls/playback-pause')
  loadImage(result.controls, 'playbackStart', 'controls/playback-start')
  loadImage(result.controls, 'playbackStop', 'controls/playback-stop')
  loadImage(result.controls, 'reverseUPS', 'controls/reverse')
  loadImage(result.controls, 'doubleUPS', 'controls/skip-forward')
  loadImage(result.controls, 'halveUPS', 'controls/skip-backward')
  loadImage(result.controls, 'goEnd', 'controls/go-end')

  loadImage(result.controls, 'matchBackward', 'controls/green-previous')
  loadImage(result.controls, 'matchForward', 'controls/green-next')

  // mark as finished
  loadImage.requestedAll = true
}


