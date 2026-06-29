import { useState } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../../Api/axios";


export default function CreatePollVotingModal({
    community,
    setMessages,
    onClose,
}) {

    const [question, setQuestion] = useState("");

    const [options, setOptions] = useState([
        "",
        ""
    ]);

    const [multipleChoice, setMultipleChoice] =
        useState(false);

    const [expiresAt, setExpiresAt] =
        useState("");

    const [loading, setLoading] =
        useState(false);


        const createPoll = async () => {

    if (!question.trim()) {

        toast.error(
            "Enter a question."
        );

        return;
    }

    const cleanedOptions =
        options.filter(
            option =>
                option.trim() !== ""
        );

    if (cleanedOptions.length < 2) {

        toast.error(
            "Add at least two options."
        );

        return;
    }

    try {

        setLoading(true);

        const { data } =
            await api.post(
                "/api/community/poll/create",
                {

                    community_id:
                        community.id,

                    question,

                    options:
                        cleanedOptions,

                    multiple_choice:
                        multipleChoice,

                    expires_at:
                        expiresAt ||

                        null

                }
            );

        setMessages(prev => [

            ...prev,

            data.message

        ]);

        toast.success(
            "Poll created."
        );

        onClose();

    } catch {

        toast.error(
            "Failed to create poll."
        );

    } finally {

        setLoading(false);

    }

};

    const updateOption = (index, value) => {

        const copy = [...options];

        copy[index] = value;

        setOptions(copy);

    };

    const removeOption = (index) => {

        if (options.length <= 2) return;

        setOptions(
            options.filter(
                (_, i) => i !== index
            )
        );

    };
    
    const addOption = () => {

    if (options.length >= 10) return;

    setOptions([
        ...options,
        ""
    ]);

    };

    return (

<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">

<div className="bg-white w-full max-w-xl max-h-[90vh] rounded-xl shadow-xl overflow-y-auto
scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin ">

<div className="flex justify-between items-center p-5 border-b">

<h2 className="font-bold text-xl">

Create Poll Voting

</h2>

<button
onClick={onClose}
>

<X />

</button>

</div>

<div className="p-5 space-y-5">

<input

value={question}

onChange={e =>
setQuestion(
e.target.value
)
}

placeholder="Ask a question..."

className="w-full border rounded-lg p-3"

/>

{
options.map(

(option,index)=>(

<div
key={index}
className="flex gap-2"
>

<input

value={option}

onChange={e=>

updateOption(
index,
e.target.value
)

}

placeholder={`Option ${index+1}`}

className="flex-1 border rounded-lg p-3"

/>

{

options.length>2 &&

<button

onClick={()=>

removeOption(index)

}

className="text-red-500"

>

<Trash2 size={20}/>

</button>

}

</div>

)

)

}

<button

onClick={addOption}

className="flex items-center gap-2 text-blue-600"

>

<Plus size={18}/>

Add option

</button>

<div className="flex items-center justify-between">

<label>

Multiple Choice

</label>

<input

type="checkbox"

checked={multipleChoice}

onChange={e=>

setMultipleChoice(

e.target.checked

)

}

/>

</div>

<div>

<label>

Expires

</label>

<input

type="date"

value={expiresAt}

onChange={e=>

setExpiresAt(

e.target.value

)

}

className="w-full border rounded-lg p-3 mt-2"

/>

</div>

<button

onClick={createPoll}

disabled={loading}

className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3"
>

{

loading

?

<p className='inline-flex gap-1 items-center'> 
<Loader2 className="animate-spin text-white" /> 
Creating </p>

:

"Create Poll"

}

</button>

</div>

</div>

</div>

);
}