package com.projet.internmatch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;

@SpringBootApplication
public class InterMatchApplication {

	private static volatile Process fastApiProcess;

	public static void main(String[] args) {
		demarrerFastAPI();

		Runtime.getRuntime().addShutdownHook(new Thread(() -> {
			if (fastApiProcess != null && fastApiProcess.isAlive()) {
				fastApiProcess.destroyForcibly();
				System.out.println("🛑 FastAPI arrêté");
			}
		}));

		SpringApplication.run(InterMatchApplication.class, args);
	}

	private static synchronized void demarrerFastAPI() {
		// Garde 1 : process encore vivant (DevTools restart)
		if (fastApiProcess != null && fastApiProcess.isAlive()) {
			System.out.println("⏭️ FastAPI déjà actif (process vivant), skip.");
			return;
		}

		// Garde 2 : port déjà occupé
		try (java.net.Socket socket = new java.net.Socket("localhost", 8000)) {
			System.out.println("⏭️ FastAPI déjà actif (port 8000 occupé), skip.");
			return;
		} catch (Exception ignored) {}

		try {
			ProcessBuilder pb = new ProcessBuilder(
					"E:/Python/python.exe",
					"-m", "uvicorn",
					"main:app", "--host", "127.0.0.1", "--port", "8000"
			);
			pb.directory(new File("E:/PFE/ia-service"));
			pb.inheritIO();
			fastApiProcess = pb.start();
			System.out.println("✅ FastAPI démarré sur le port 8000");

		} catch (Exception e) {
			System.err.println("⚠️ Impossible de démarrer FastAPI : " + e.getMessage());
		}
	}
}