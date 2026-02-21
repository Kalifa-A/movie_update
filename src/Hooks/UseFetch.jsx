import { useState, useEffect } from 'react'

export default function useFetch(api_path) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!api_path) {
            setData(null)
            setError('Missing api_path')
            setLoading(false)
            return
        }

        const API_KEY = import.meta.env.VITE_API_ID
        if (!API_KEY) {
            setData(null)
            setError('Missing VITE_API_ID in .env')
            setLoading(false)
            return
        }

        const controller = new AbortController()
        setLoading(true)
        setError(null)

        const url = `https://api.themoviedb.org/3/movie/${api_path}?language=en-US&page=1&api_key=${API_KEY}`

        fetch(url, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status}`)
                return res.json()
            })
            .then((json) => {
                setData(json)
                setLoading(false)
            })
            .catch((err) => {
                if (err.name === 'AbortError') return
                setError(err.message)
                setLoading(false)
            })

        return () => controller.abort()
    }, [api_path]) // re-fetch when api_path changes

    return { data, loading, error }
}