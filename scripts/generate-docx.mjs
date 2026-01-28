import { convertMarkdownToDocx } from '@mohtasham/md-to-docx'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const inputPath = join(__dirname, '../Aliaksandr_Diploma_Submission/combined_documentation.md')
const outputPath = join(__dirname, '../Aliaksandr_Diploma_Submission/Aliaksandr_Samatyia_Diploma.docx')

console.log('Reading markdown file:', inputPath)
const markdown = readFileSync(inputPath, 'utf-8')

console.log('Converting to DOCX...')
const blob = await convertMarkdownToDocx(markdown, {
    documentType: 'document',
    style: {
        paragraphSize: 24,
        headingSize: 14,
        heading1Alignment: 'CENTER',
        lineSpacing: 1.5
    }
})

const buffer = Buffer.from(await blob.arrayBuffer())

console.log('Writing DOCX file:', outputPath)
writeFileSync(outputPath, buffer)

console.log('Done! Generated:', outputPath)
