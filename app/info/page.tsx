export default function Info() {
  return (
    <div className="bg-black flex justify-center min-h-screen p-10">
      <div className="lg:w-2/3 text-justify flex flex-col gap-2">
        <p>
          This simulation is based on{" "}
          <a
            href="https://uwe-repository.worktribe.com/output/980579"
            className="inline text-blue-500 underline"
          >
            this paper
          </a>
          , so please refer to it for more information on what the variables
          represent.
        </p>
        <p>
          That said, there is a big difference with the original difference:
          agent in simulation do not interact directly among themselves. This
          means that whereas in the simulation described in the paper a check is
          done before moving an agent, this is not the case in the present
          simulation. Consequently, many agents can coexist in a given cell at a
          given moment.
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
