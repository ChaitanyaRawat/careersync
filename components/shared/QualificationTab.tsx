
import { qualification } from "../forms/AccountProfile"


const QualificationTab = ({ qualifications }: { qualifications: qualification[] }) => {

    return (
        <div>
            {(qualifications && qualifications.length) > 0 && (
                qualifications.map((qualification) => (

                    <div className='w-full flex flex-col bg-white p-2 rounded-lg my-2 overflow-auto'>

                        

                            <h2 className=' text-black text-heading3-bold'>
                                {qualification.name}
                            </h2>
                            <p className='text-base-medium text-gray-1'>
                                {qualification.issuingAuthority}
                            </p>
                            <a href={qualification.credentialUrl} target="_blank" className="h-10 font-bold text-blue rounded-lg inline">
                                {qualification.credentialUrl}
                            </a>
                       



                    </div>
                ))

            )
            }
        </div>
    )
}

export default QualificationTab