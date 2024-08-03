<script>
    const db = firebase.firestore()

    async function getquestions() {
        const qs = await db.collection('questions').orderBy('level').get()
        const data = await Promise.all(qs.docs.map(async doc => {
            return {
                id: doc.id,
                ...await doc.data()
            }
        }))

        return data
    }
</script>




<h1>Questions</h1>

<a href="/questions/add">add question</a>

{#await getquestions()}
    <p>Loading...</p>
{:then questions} 
    <ul>

        {#each questions as q}
            <li><a href={`/questions/${q.id}`}>{q.name}</a></li>
        {/each}

    </ul>
{/await}