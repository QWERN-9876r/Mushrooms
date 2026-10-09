class PageLoadStore {
    #progress = $state(0)
    #ready = $state(false)

    get progress() {
        return this.#progress
    }

    get ready() {
        return this.#ready
    }

    reset() {
        this.#progress = 0
        this.#ready = false
    }

    setProgress(value: number) {
        this.#progress = Math.min(100, Math.max(0, Math.round(value * 100)))
    }

    complete() {
        this.#progress = 100
        this.#ready = true
    }
}

export const pageLoad = new PageLoadStore()
