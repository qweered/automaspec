import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { DrizzleSnapshot } from '../lib/types'

import { DB_SCHEMA_DIAGRAM } from '../lib/constants'

const getSnapshotIndex = (fileName: string) => {
    const match = /^(\d+)_snapshot\.json$/.exec(fileName)
    if (!match) {
        return null
    }

    const index = Number(match[1])
    if (!Number.isFinite(index)) {
        return null
    }

    return index
}

const getLatestSnapshotPath = async () => {
    const snapshotDir = path.join(process.cwd(), DB_SCHEMA_DIAGRAM.SNAPSHOT_DIR)
    const entries = await readdir(snapshotDir)

    let latestIndex: number | null = null
    let latestFileName: string | null = null

    for (const fileName of entries) {
        if (!fileName.endsWith(DB_SCHEMA_DIAGRAM.SNAPSHOT_SUFFIX)) {
            continue
        }

        const index = getSnapshotIndex(fileName)
        if (index === null) {
            continue
        }

        if (latestIndex === null || index > latestIndex) {
            latestIndex = index
            latestFileName = fileName
        }
    }

    if (!latestFileName) {
        throw new Error(`No snapshot files found in ${DB_SCHEMA_DIAGRAM.SNAPSHOT_DIR}`)
    }

    return path.join(snapshotDir, latestFileName)
}

const getRelationshipLine = (fkName: string, tableFrom: string, tableTo: string) => {
    const label = fkName.replace(/"/g, "'")
    return `    ${tableTo} ||--o{ ${tableFrom} : "${label}"`
}

const getColumnLine = (columnName: string, columnType: string, isPrimaryKey: boolean, isForeignKey: boolean) => {
    const tokens: string[] = []

    if (isPrimaryKey) {
        tokens.push('PK')
    }

    if (isForeignKey) {
        tokens.push('FK')
    }

    if (tokens.length === 0) {
        return `        ${columnName} ${columnType}`
    }

    return `        ${columnName} ${columnType} ${tokens.join(' ')}`
}

const buildMermaidErd = (snapshot: DrizzleSnapshot) => {
    const lines: string[] = []

    lines.push('erDiagram')

    const relationshipLines: string[] = []

    for (const [tableKey, table] of Object.entries(snapshot.tables)) {
        const tableName = table.name ?? tableKey

        lines.push(`    ${tableName} {`)

        const foreignKeyColumns = new Set<string>()
        for (const fk of Object.values(table.foreignKeys ?? {})) {
            for (const columnFrom of fk.columnsFrom) {
                foreignKeyColumns.add(columnFrom)
            }

            relationshipLines.push(getRelationshipLine(fk.name, fk.tableFrom, fk.tableTo))
        }

        for (const [columnKey, column] of Object.entries(table.columns)) {
            const columnName = column.name ?? columnKey
            lines.push(
                getColumnLine(columnName, column.type, Boolean(column.primaryKey), foreignKeyColumns.has(columnName))
            )
        }

        lines.push('    }')
    }

    if (relationshipLines.length > 0) {
        lines.push('')
        for (const relationshipLine of relationshipLines) {
            lines.push(relationshipLine)
        }
    }

    lines.push('')

    return lines.join('\n')
}

const main = async () => {
    const latestSnapshotPath = await getLatestSnapshotPath()
    const text = await readFile(latestSnapshotPath, 'utf8')
    const snapshot = JSON.parse(text) as DrizzleSnapshot

    const outputPath = path.join(process.cwd(), DB_SCHEMA_DIAGRAM.OUTPUT_PATH)
    await mkdir(path.dirname(outputPath), { recursive: true })

    const mermaid = buildMermaidErd(snapshot)
    await writeFile(outputPath, mermaid, 'utf8')

    process.stdout.write(`${DB_SCHEMA_DIAGRAM.OUTPUT_PATH}\n`)
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exitCode = 1
})
