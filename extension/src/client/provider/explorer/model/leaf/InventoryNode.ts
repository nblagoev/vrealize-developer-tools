/*!
 * Copyright 2018-2019 VMware, Inc.
 * SPDX-License-Identifier: MIT
 */

import * as path from "path"

import { VroRestClient } from "vrealize-common"
import * as vscode from "vscode"
import * as fs from "fs-extra"

import { AbstractNode, IconPath } from "../AbstractNode"

export class InventoryNode extends AbstractNode {
    private readonly iconPath: string

    constructor(
        readonly id: string,
        readonly name: string,
        readonly type: string,
        readonly namespace: string,
        restClient: VroRestClient,
        context: vscode.ExtensionContext
    ) {
        super(restClient, context)

        const storagePath = path.join(context["globalStoragePath"], "inventory-icons", namespace)
        if (!fs.existsSync(storagePath)) {
            fs.mkdirpSync(storagePath)
        }

        this.iconPath = path.join(storagePath, `${type || name}.png`)
    }

    async getChildren(): Promise<AbstractNode[]> {
        const children = await this.restClient.getInventoryItems(this.id)
        const childNodes: InventoryNode[] = []

        for (const child of children) {
            if (child.rel !== "down") {
                continue
            }

            childNodes.push(
                new InventoryNode(child.href, child.name, child.type, this.namespace, this.restClient, this.context)
            )
        }

        return childNodes
    }

    async asTreeItem(): Promise<vscode.TreeItem> {
        const item = new vscode.TreeItem(this.name)
        item.id = this.id
        item.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
        item.iconPath = this.icon

        if (!fs.existsSync(this.iconPath)) {
            await this.restClient.fetchIcon(this.namespace, this.type, this.iconPath)
        }

        return item
    }

    protected get icon(): IconPath {
        return this.iconPath
    }
}
