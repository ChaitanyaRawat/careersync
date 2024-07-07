import { Key } from "react"
import { experience } from "../forms/AccountProfile"

const ExperiencesTab = ({ userExperiences }: { userExperiences: string }) => {
    const experiences = JSON.parse(userExperiences)
    return (
        <div className="flex flex-col gap-4">
            {experiences && experiences.length > 0 &&
                experiences.map((exp: experience, index: Key | null | undefined) => (
                    <div key={index} className="bg-white rounded-lg w-full text-black p-4 flex flex-col gap-2">
                        <h4 className="text-base-semibold text-gray-1"><span className="font-bold text-black">Position : </span>{exp.position}</h4>
                        <h4 className="text-base-semibold text-gray-1"><span className="font-bold text-black">Company : </span>{exp.companyName}</h4>
                        <h4 className="text-base-semibold text-gray-1"><span className="font-bold text-black">From : </span>{exp.from.substring(0, 10)}</h4>
                        <h4 className="text-base-semibold text-gray-1"><span className="font-bold text-black">To : </span>{exp.to.substring(0, 10)}</h4>
                        <div className="overflow-auto">
                            <p className="text-base-semibold text-black">Description</p>
                            <p className="text-small-medium text-gray-1">{exp.description}</p>
                        </div>
                        {/* credentials */}
                        <div>

                            <p className="text-base-semibold text-black">Credential:</p>
                            <a href={exp.credential} target="_blank" className="h-10 font-bold text-blue rounded-lg inline">{exp.credential}</a>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default ExperiencesTab