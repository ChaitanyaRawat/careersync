import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion"
import { skill } from "../forms/AccountProfile"


const SkillTab = ({ skills }: { skills: skill[] }) => {

    return (
        <div>
            {(skills && skills.length) > 0 && (

                <Accordion type="single" collapsible className="w-full  rounded-lg p-2 ">
                    {skills.map((skill) => (
                        <AccordionItem value={skill.skillName} key={skill.skillName} className='my-2 border-1 border-black bg-white rounded-lg p-2 w-full'>

                            <AccordionTrigger className="text-black">{skill.skillName}</AccordionTrigger>
                            {/* <button className='bg-red-500 text-white p-2 rounded-lg' onClick={() => removeFromSkillState(skill.skillName)} >Delete</button> */}




                            <AccordionContent className='pt-3 overflow-y-scroll flex flex-col gap-2'>
                                {
                                    skill.credentials.map((credential: string) => (
                                        <a
                                            href={credential}
                                            key={credential}
                                            target="_blank"
                                            className="px-2 mx-1 py-1 rounded  text-primary-500 hover:bg-light-2 border border-black overflow-y-scroll"
                                        >
                                            {credential}
                                        </a>
                                    ))
                                }

                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )
            }
        </div>
    )
}

export default SkillTab