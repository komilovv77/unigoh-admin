import React, { useCallback, useState } from 'react'
import { useAdmin } from '../App'
import { useApplications } from '../lib/data'
import { PageTitle, ErrorBox, inputCls } from '../components/ui'
import AppTable from '../components/AppTable'

export default function Applications({ params }) {
  const { isMaster, universities } = useAdmin()
  const data = useApplications({ isMaster })
  const [uni, setUni] = useState(params.get('uni') || '')
  const filter = useCallback((a) => !uni || a.university_id === uni, [uni])

  return (
    <div>
      <PageTitle
        title="Arizalar"
        subtitle={isMaster ? 'Barcha universitetlarga kelgan arizalar' : "Universitetingizga kelgan arizalar"}
        action={isMaster && (
          <select className={`${inputCls} sm:w-72`} value={uni} onChange={(e) => setUni(e.target.value)}>
            <option value="">Barcha universitetlar</option>
            {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        )}
      />
      <ErrorBox error={data.error} />
      <AppTable
        key={params.toString()}
        data={data}
        showUniversity={isMaster}
        initialStatus={params.get('status') || ''}
        initialQuery={params.get('q') || ''}
        initialFlag={params.get('flag') === '1'}
        extraFilter={filter}
      />
    </div>
  )
}
