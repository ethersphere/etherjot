import { Files } from 'cafe-node-utility'
import { GlobalState, getPath } from '../engine/GlobalState'
import { exportToWeb2 } from '../engine/Web2Export'
import { createFooter } from '../html/Footer'
import { createHeader } from '../html/Header'
import { createHtml5 } from '../html/Html5'
import { createStyleSheet } from '../html/StyleSheet'

export async function createSearchPage(globalState: GlobalState): Promise<{ swarmReference: string }> {
    const head = `<title>${globalState.configuration.title}</title>${createStyleSheet(0)}`
    const body = `
    ${await createHeader(globalState, 0, 'Latest')}
    <main>
        <div class="grid-container content-area search">
            <div class="grid-3"></div>
            <div class="grid-6">
                <div class="search-form">
                    <input type="text" id="search" name="search" placeholder="Search..." />
                    <button id="search-button">Search</button>
                </div>
                <div id="results"></div>
            </div>
        </div>
    </main>
    ${await createFooter(globalState, 0)}
    <script>
        const searchData = ${await createSearchData()}
        const searchButton = document.getElementById('search-button')
        const searchInput = document.getElementById('search')
        function doSearch() {
            const search = searchInput.value
            const results = []
            for (const title in searchData) {
                if (searchData[title].data.toLowerCase().includes(search.toLowerCase())) {
                    results.push({ title, link: searchData[title].link })
                }
            }
            const resultsElement = document.getElementById('results')
            resultsElement.innerHTML = ''
            if (!results.length) {
                const resultElement = document.createElement('div')
                resultElement.innerHTML = 'No results found'
                resultsElement.appendChild(resultElement)
            }
            for (const result of results) {
                const resultElement = document.createElement('div')
                resultElement.className = 'search-result'
                resultElement.innerHTML = '<a href="' + result.link + '">' + result.title + '</a>'
                resultsElement.appendChild(resultElement)
            }
        }
        searchButton.addEventListener('click', doSearch)
        searchInput.addEventListener('keyup', function(event) {
            if (event.keyCode === 13) {
                event.preventDefault()
                doSearch()
            }
        })
    </script>`
    const html = await createHtml5(head, body)
    const htmlResults = await globalState.bee.uploadData(globalState.stamp, html)
    await exportToWeb2('search.html', html)
    return {
        swarmReference: htmlResults.reference
    }
}

async function createSearchData(): Promise<string> {
    const data = await Files.readJsonAsync(getPath('.jot.search.json'))
    return JSON.stringify(data)
}
