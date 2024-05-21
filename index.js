document.addEventListener('DOMContentLoaded', () => {
    clearQueryStringsOnLoad()
    updateFilterCount()
    carregarNoticias()
});

function openFilters() {
    const modal = document.getElementById('filter-dialog')
    modal.style.display = 'block'
}

function closeFilters() {
    const modal = document.getElementById('filter-dialog')
    modal.style.display = 'none'
}


function applyFilters(event) {
    event.preventDefault()

    const tipo = document.getElementById('tipo').value
    const qtd = document.getElementById('quantidade').value
    const de = document.getElementById('de').value
    const ate = document.getElementById('ate').value

    const filters = { tipo, qtd, de, ate };

    const params = new URLSearchParams(window.location.search)
    let filterCount = 0

    Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'Selecione') {
            params.set(key, filters[key])
            filterCount++
        } else {
            params.delete(key)
        }
    })

    document.getElementById('filter-count').textContent = Math.max(filterCount, 1)

    window.history.replaceState({}, '', `${window.location.pathname}?${params}`)

    closeFilters()

    carregarNoticias()
}

function updateFilterCount() {
    const params = new URLSearchParams(window.location.search)
    let filterCount = 0

    params.forEach((value, key) => {
        if (key !== 'page' && key !== 'busca' && value) {
            filterCount++
        }
    })

    document.getElementById('filter-count').textContent = Math.max(filterCount, 1)
}


function clearQueryStringsOnLoad() {
    const params = new URLSearchParams(window.location.search)
    const keysToDelete = []

    params.forEach((value, key) => {
        if (key !== 'page' && key !== 'busca') {
            keysToDelete.push(key)
        }
    })

    keysToDelete.forEach(key => {
        params.delete(key)
    })

    window.history.replaceState({}, '', `${window.location.pathname}`)
}

function formatData(datas){
    const [date, time] = datas.split(' ')
    const [day, month, year] = date.split('/')
    const formatDate = `${year}-${month}-${day}T${time}`

    const dataApi = new Date(formatDate)
    const dateToday = new Date()

    let diferencaEmMilissegundos = dateToday - dataApi
    let diferencaEmDias = diferencaEmMilissegundos / (1000 * 60 * 60 * 24)
    diferencaEmDias = Math.round(diferencaEmDias);
    let textDias = ""

    if (diferencaEmDias === 0){
        textDias = 'Publicado hoje'
    }else if (diferencaEmDias === 1) {
        textDias = 'Publicado Ontem'
    }else{
        textDias = `Publicado há ${diferencaEmDias} Dias`
    }

    
    return textDias
}

async function carregarNoticias() {
    try {
        const params = new URLSearchParams(window.location.search)

        if (!params.has('qtd')) {
            params.set('qtd', '10')
        }

        const url = `https://servicodados.ibge.gov.br/api/v3/noticias?${params.toString()}`
        const response = await fetch(url)
        const data = await response.json()
        console.log(data.items)

        const noticias = document.querySelector('.noticia-list')
        noticias.innerHTML = ''

            data.items.forEach(noticia => {
                const noticiaItem = document.createElement('li')
                const textContent = document.createElement('div')
                const editorial = document.createElement('div')
                const h2 = document.createElement('h2')
                const imagens = JSON.parse(noticia.imagens)
                const img = document.createElement('img')
                const introducao = document.createElement('p')
                const editoriais = document.createElement('h5')
                const dataPubli = document.createElement('span')
                const espacamento = document.createElement('hr')
                const link = document.createElement('a')
                const buttom = document.createElement('button')

                img.src = `https://agenciadenoticias.ibge.gov.br/${imagens.image_intro}`
                img.alt = imagens.image_intro_alt
                h2.textContent = noticia.titulo
                introducao.textContent = noticia.introducao  
                editoriais.textContent = `#${noticia.editorias}`

                dataPubli.textContent = formatData(noticia.data_publicacao)
                textContent.setAttribute('class', 'text-content')
                dataPubli.setAttribute('class', 'publicacao')
                link.href = noticia.link
                link.target = '_blank'
                buttom.textContent = "Leia Mais"
                buttom.setAttribute('class', "leia-mais")

                noticiaItem.appendChild(img)
                noticiaItem.appendChild(textContent)
                textContent.appendChild(h2)
                textContent.appendChild(introducao)
                textContent.appendChild(editorial)
                link.appendChild(buttom)
                textContent.appendChild(link)
                editoriais.appendChild(dataPubli)
                editorial.appendChild(editoriais)
                noticias.appendChild(noticiaItem)
                noticias.appendChild(espacamento)
            })
    } catch (error) {
        console.error('Erro ao carregar notícias', error)
    }
}


document.getElementById('filter-form').addEventListener('submit', applyFilters)
