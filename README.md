# Slime mold simulation

This simulation was inspired on [this video](https://www.youtube.com/watch?v=X-iSQQgOd1A) which, in turn, references [this paper](https://uwe-repository.worktribe.com/output/980579) , so please refer to these for more information on what the variables represent.

That said, there is a big difference with the original difference: agents in this simulation do not interact directly among themselves. In the mentioned paper, before moving an agent, a check is made and if there already is an agent in the position it should move, then it does not. In this simulation such a check is not made.

This is mainly done to simplify the code in the simulation and improve performance. In adition, though there are diferences, patter formation still emerges in the presence of this change.
