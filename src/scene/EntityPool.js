// Generic free/active object pool.
// No per-frame allocation in the steady state.

export class EntityPool {
  constructor({ factory, reset, initialSize = 0 }) {
    this._factory = factory
    this._reset = reset || null
    this._free = []
    this._active = []

    for (let i = 0; i < initialSize; i++) {
      this._free.push(this._factory())
    }
  }

  acquire() {
    const instance = this._free.length > 0 ? this._free.pop() : this._factory()
    this._active.push(instance)
    return instance
  }

  release(instance) {
    const idx = this._active.indexOf(instance)
    if (idx === -1) return
    this._active.splice(idx, 1)
    if (this._reset) this._reset(instance)
    this._free.push(instance)
  }

  forEachActive(fn) {
    for (let i = this._active.length - 1; i >= 0; i--) {
      fn(this._active[i], i)
    }
  }

  get activeCount() { return this._active.length }
  get freeCount() { return this._free.length }
}
