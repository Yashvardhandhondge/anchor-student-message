import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StudentMessageProgram } from "../target/types/student_message_program";
import { expect } from "chai";

describe("student-message-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.StudentMessageProgram as Program<StudentMessageProgram>;

 
  const userWallet = anchor.workspace.StudentMessageProgram.provider.wallet;
  
  
  console.log("userWallet:", userWallet);
  
 
  const userPublicKey = userWallet.publicKey;

  const student = {
    name: "name",
    message: "message",
    publicKey: userPublicKey,  
  };

  const realloc = {
    name: "realloc",
    message: "realloc",
  };

  const [studentIntroPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [student.publicKey.toBuffer()],
    program.programId
  );

  it("Add Student Intro", async () => {
    const tx = await program.methods
      .addStudentIntro(student.name, student.message)
      .accountsPartial({
        studentIntro: studentIntroPda,
        student: userPublicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const account = await program.account.studentInfo.fetch(studentIntroPda);
    expect(student.name === account.name);
    expect(student.message === account.message);
  });

  it("Update Student Intro", async () => {
    const tx = await program.methods
      .updateStudentIntro(realloc.name, realloc.message)
      .accountsPartial({
        studentIntro: studentIntroPda,
        student: userPublicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const account = await program.account.studentInfo.fetch(studentIntroPda);
    expect(realloc.name === account.name);
    expect(realloc.message === account.message);
  });

  it("Close Account", async () => {
    const tx = await program.methods
      .close()
      .accountsPartial({
        studentIntro: studentIntroPda,
        student: userPublicKey,
      })
      .rpc();

    try {
      const account = await program.account.studentInfo.fetch(studentIntroPda);
    } catch (e) {
      console.log("\n Failed fetching account:", e);
    }
  });
});
