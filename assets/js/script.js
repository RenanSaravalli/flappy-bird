function newElement(tagName, className) {
    const element = document.createElement(tagName);
    element.className = className;
    return element;
}

function Barrier(reversa = false) {
    this.element = newElement('div', 'barrier')

    const edge = newElement('div', 'barrier-edge')
    const body = newElement('div', 'barrier-body')

    this.element.appendChild(reversa ? body : edge)
    this.element.appendChild(reversa ? edge : body)

    this.setHeight = height => body.style.height = `${height}px`
}

function PairOfBarriers(height, opening, x) {
    this.element = newElement('div', 'pair-of-barriers')

    this.upper = new Barrier(true)
    this.lower = new Barrier(false)

    this.element.appendChild(this.upper.element)
    this.element.appendChild(this.lower.element)

    this.drawOpening = () => {
        const topHeight = Math.random() * (height - opening) 
        const lowerHeight = height - opening - topHeight

        this.upper.setHeight(topHeight)
        this.lower.setHeight(lowerHeight)
    } 

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.drawOpening()
    this.setX(x)
}

function Barriers (height, width, opening, space, notifyPoint) {
    this.pairs = [
        new PairOfBarriers(height, opening, width), 
        new PairOfBarriers(height, opening, width + space),
        new PairOfBarriers(height, opening, width + space * 2),
        new PairOfBarriers(height, opening, width + space * 3)
    ]

    const movement = 3 

    this.move = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - movement)

            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.drawOpening()
            }

            const half = width / 2
            const crossedHalf = pair.getX() + movement >= half && pair.getX() < half
            if(crossedHalf) notifyPoint()
        })

    }
}

function Bird(gameHeight) {
    let flying = false
    this.element = newElement('img', 'bird')
    this.element.src = 'assets/images/passaro.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.move = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const maxHeight = gameHeight - this.element.clientWidth

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }
    this.setY(gameHeight / 2)
}

function Progress() {
    this.element = newElement('span', 'progress')
    this.updatePoints = points => {
        this.element.innerHTML = points
    }
    this.updatePoints(0)
}

function overlapping(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical 
}

function collided(bird, barriers) {
    let collided = false

    barriers.pairs.forEach(pairOfBarriers => {
        if (!collided) {
            const upper = pairOfBarriers.upper.element
            const lower = pairOfBarriers.lower.element
            collided = overlapping(bird.element, upper) || overlapping(bird.element, lower)
        }
    })
    return collided
}

function FlappyBird() {
    let points = 0

    const game = document.querySelector('[wm-flappy]')
    const height = game.clientHeight
    const width = game.clientWidth

    const progress = new Progress()
    const barriers = new Barriers(height, width, 200, 400, () => progress.updatePoints(++points))

    const bird = new Bird(height)
    game.appendChild(progress.element)
    game.appendChild(bird.element)
    barriers.pairs.forEach(pair => game.appendChild(pair.element))

    this.start = () => {
        const timer = setInterval(() => {
            barriers.move()
            bird.move()

            if (collided(bird, barriers)) {
                clearInterval(timer)
            }
        },20)
    }
}

new FlappyBird().start()