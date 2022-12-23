import Head from 'next/head'
import Image from 'next/image'
import { useRef, useState } from 'react'

export default function Home() {

  const url = useRef()
  const [shelves, setShelves] = useState([])

  async function load() {
    let xml = await fetchXML('/api/hello?url=' + url.current.value)
    let books = [...xml.querySelectorAll('item')].map(i => {
      let shelves = i.querySelector('user_shelves').textContent.split(', ')
      let unread = shelves.includes('to-read')
      shelves = shelves.filter(s => s && s != 'to-read')
      return {
        id: i.querySelector('book_id').textContent,
        title: i.querySelector('title').textContent,
        image: i.querySelector('book_large_image_url').textContent,
        shelves: shelves,
        unread: unread
    }})
    let shelves = { multiple: [], none: [] }
    for (let book of books) {
      for (let s of book.shelves) {
        let shelf = shelves[s]
        if (!shelf) {
          shelf = []
          shelves[s] = shelf
        }
        shelf.push(book)
      }
      if (!book.shelves.length) {
        shelves.none.push(book)
      } else if (book.shelves.filter(s => s != 'currently-reading').length > 1) {
        shelves.multiple.push(book)
      }
    }
    let bs = []
    let names = {
      'currently-reading': 'Currently reading',
      multiple: 'Multiple shelves', 
      none: 'No shelf'
    }
    for (let name in names) {
      if (shelves[name]?.length) {
        bs.push({name: names[name], books: shelves[name]})
        shelves[name].sort((a, b) => a.unread - b.unread)
      }
    }
    for (let shelf in shelves) {
      if (!names[shelf] && shelves[shelf].length) {
        bs.push({name: shelf, books: shelves[shelf]})
        shelves[shelf].sort((a, b) => a.unread - b.unread)
      }
    }
    setShelves(bs)
  }

  function fetchXML(url) {
    return new Promise(resolve => {
      var xhttp = new XMLHttpRequest()
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          resolve(xhttp.responseXML)
        }
      }
      xhttp.open('GET', url)
      xhttp.send()
    })
  }

  return <>
    Enter Goodreads user ID:<br/>
    <input ref={url}/>&nbsp;
    <button onClick={load}>Load</button>
    <br/>
    { shelves.map(s => <div key={s.name}>
      <h2>{s.name}</h2>
      { s.books.map(b => <img className={b.unread ? 'unread' : ''} key={b.id} src={b.image}/> )}
    </div> )}
  </>
}
