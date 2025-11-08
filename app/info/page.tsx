export default function Info() {
  return (
    <div className="bg-black flex justify-center min-h-screen p-10">
      <div className="lg:w-2/3 text-justify flex flex-col gap-2">
        <p>
          This simulation was inspired on{" "}
          <a
            href="https://www.youtube.com/watch?v=X-iSQQgOd1A"
            className="inline text-blue-500 underline"
          >
            this video
          </a>{" "}
          which, in turn, references{" "}
          <a
            href="https://uwe-repository.worktribe.com/output/980579"
            className="inline text-blue-500 underline"
          >
            this paper
          </a>
          , so please refer to these for more information on what the variables
          represent.
        </p>
        <p>
          That said, there is a big difference with the original difference:
          agents in this simulation do not interact directly among themselves.
          In the mentioned paper, before moving an agent, a check is made and if
          there already is an agent in the position it should move, then it does
          not. In this simulation such a check is not made.
        </p>
        <p>
          This is mainly done to simplify the code in the simulation and improve
          performance. In adition, though there are diferences, patter formation
          still emerges in the presence of this change.
        </p>
      </div>
    </div>
  );
}
