/*!
 * Copyright 2018-2019 VMware, Inc.
 * SPDX-License-Identifier: MIT
 */

import { ExtensionContext } from "vscode"

export class GlobalState {
    private context: ExtensionContext
    private namespace: string
    private state: {}

    private constructor(context: ExtensionContext, namespace: string) {
        if (!context) {
            throw new Error("Missing context parameter")
        }

        this.context = context
        this.namespace = namespace
        this.state = this.context.globalState.get(this.namespace, {})
    }

    static from(context: ExtensionContext, namespace?: string): GlobalState {
        return new GlobalState(context, namespace || "cache")
    }

    set(key: string, value?: any, expiration?: number): Thenable<void> {
        if (typeof key !== "string" || typeof value === "undefined") {
            return new Promise((resolve, reject) => {
                resolve(void 0)
            })
        }

        const obj = {
            value: value,
            expiration: -1
        }

        if (expiration && Number.isInteger(expiration)) {
            obj.expiration = this.now() + expiration
        }

        this.state[key] = obj
        return this.context.globalState.update(this.namespace, this.state)
    }

    get<T>(key: string, defaultValue?: T): T | undefined {
        if (this.state[key] === undefined) {
            if (defaultValue !== undefined) {
                return defaultValue
            }

            return undefined
        }

        if (this.isExpired(key)) {
            return undefined
        }

        return this.state[key].value
    }

    has(key: string): boolean {
        if (this.state[key] === undefined) {
            return false
        }

        return !this.isExpired(key)
    }

    remove(key: string): Thenable<void> {
        if (this.state[key] === undefined) {
            return new Promise((resolve, reject) => {
                resolve(void 0)
            })
        }

        delete this.state[key]
        return this.context.globalState.update(this.namespace, this.state)
    }

    keys(): string[] {
        return Object.keys(this.state)
    }

    all() {
        const items = {}
        for (const key in this.state) {
            items[key] = this.state[key].value
        }

        return items
    }

    clear() {
        this.state = {}
        return this.context.globalState.update(this.namespace, undefined)
    }

    getExpiration(key: string): number | undefined {
        if (this.state[key] === undefined || this.state[key].expiration === undefined) {
            return undefined
        }

        return this.state[key].expiration
    }

    isExpired(key: string): boolean {
        if (this.state[key] === undefined || this.state[key].expiration === undefined) {
            return false
        }

        return this.now() >= this.state[key].expiration
    }

    private now(): number {
        return Math.floor(Date.now() / 1000)
    }
}
